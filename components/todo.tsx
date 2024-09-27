"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import Highlight, { type HighlightContext, type FocusedWindow } from "@highlight-ai/app-runtime"
import { useName } from './providers/NameProvider'; // Adjust the path based on where you save the context

type StatusType = 'pending' | 'completed' | 'deleted' | 'false_positive';
type AdditionMethodType = 'manually' | 'automatically' | 'semi_automatically';

export interface Task {
  id: string;
  text: string;
  status: StatusType;
  additionMethod: AdditionMethodType;
  fadingOut: boolean;
  lastModified: string;  // ISO 8601 format
}

interface TodoItemProps {
  todo: Task;
  onCheckedChange: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onCheckedChange, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  useEffect(() => {
    setEditText(todo.text);
  }, [todo.text]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      if (e.key === 'Enter') {
        onUpdate(todo.id, editText);
      }
      setIsEditing(false);
      setEditText(todo.text);
    }
  };

  const handleBlur = () => {
    onUpdate(todo.id, editText);
    setIsEditing(false);
  };

  return (
    <div
      className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md transition-all duration-300 ${
        (todo.status === 'completed' || todo.fadingOut) ? "opacity-50" : ""
      } ${todo.fadingOut ? "opacity-0" : ""}`}
    >
      <div className="flex items-center flex-grow">
        <Checkbox
          id={`todo-${todo.id}`}
          checked={todo.status === 'completed'}
          onCheckedChange={() => onCheckedChange(todo.id)}
          className="mr-3"
        />
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            autoFocus
            className="flex-grow bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
          />
        ) : (
          <label
            htmlFor={`todo-${todo.id}`}
            onClick={() => setIsEditing(true)}
            className={`flex-grow cursor-pointer ${
              todo.status === 'completed' ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-200"
            }`}
          >
            {todo.text}
          </label>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(todo.id)}
        className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
      >
        <Trash2Icon className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function Todo() {
  const lastCallTime = useRef(0);
  const [todos, setTodos] = useState<Task[]>([]);
  const [newTodo, setNewTodo] = useState("")
  const { name, handleNameUpdate } = useName(); // Destructure name and handleNameUpdate from the context
  const [ userName, setUserName] = useState(name);
  const nameRef = useRef(name); // Ref to hold the current name

  const [isEditingName, setIsEditingName] = useState(false)
  const [showCompletedTodos, setShowCompletedTodos] = useState(false)
  const [showHelpSection, setShowHelpSection] = useState(false)
  const [hotKey, setHotKey] = useState("")
  const completedTodos = todos.filter((todo) => todo.status === 'completed')
  const incompleteTodos = todos.filter((todo) => todo.status === 'pending')
  const [slmCapable, setSlmCapable] = useState(false);

  useEffect(() => {
    nameRef.current = name;
  }, [name]);

  useEffect(() => {
    const getShowHelpSection = async () => {
      const showHelp = await Highlight.appStorage.get("showHelpSection") ?? true;
      setShowHelpSection(showHelp);
    }
    getShowHelpSection();
  }, []);

  useEffect(() => {
    const isSlmCapable = async () => {
      setSlmCapable(await Highlight.inference.isSlmCapable());
    }
    isSlmCapable();
  }, []);

  useEffect(() => {
    const getHotKey = async () => {
      const hotKey = await Highlight.app.getHotkey();
      setHotKey(hotKey);
    }
    getHotKey();
  }, []);

  const handleUserNameEdit = () => {
    setIsEditingName(true)
  }
  const handleUserNameSave = (newName: string) => {
    handleNameUpdate(newName)
    setIsEditingName(false)
  }

  const tableName = "tasks"; 

  // Load tasks from the VectorDB
  const loadTasks = async () => {
    const tasks = await Highlight.vectorDB.getAllItems(tableName);
    const taskObjects = tasks.map((task) => {
      return {
        id: task.id,
        text: task.text,
        status: task.metadata.status,
        additionMethod: task.metadata.additionMethod,
        lastModified: task.metadata.lastModified,
        fadingOut: false
      };
    });
    setTodos(taskObjects);
  };

  const addTask = async (task: string, sourceDocument: string | undefined, additionMethod: AdditionMethodType, status?: StatusType) => {
    console.log("Adding task : ", task);
    await Highlight.vectorDB.insertItem(
      tableName,
      task,
      sourceDocument,
      {
        status: status ? status : 'pending',
        additionMethod: additionMethod,
        lastModified: new Date().toISOString()
      }
    );
    if (additionMethod === 'automatically' && status !== 'false_positive') {
      await Highlight.app.showNotification('New task added to TODO list', task);
    }
    loadTasks();
  }

  useEffect(() => {
    const destructor = Highlight.app.addListener('onContext', async (context: HighlightContext) => {
      if (context.suggestion) {
        addTask(context.suggestion, context.environment.ocrScreenContents ? context.environment.ocrScreenContents : undefined, 'semi_automatically');
      }
    })

    return () => {
      destructor();
    };
  });

  const system_prompt = `You are a helpful AI assistant designed to analyze conversations and detect whether any task has been assigned to the current user whose name will be provided. This conversation could be a group conversation or a one-on-one chat.
  Your goal is to identify the following.
  1. Whether the current user has been assigned any task as a result of the conversion?
  2. If the answer to the above question is yes, then a single line task that can be added to the TODO list of the user.

  Instructions:
  1. The user will provide a full name followed by one or more conversations seen on their computer screen.
  2. Analyze the conversation and determine if there's a task the mentioned user needs to complete.
  3. Consider only explicitly mentioned tasks for the mentioned user.
  4. If a task is assigned, provide a short, single-line description that can be directly added to a todo list.
  5. The task should be something the user mentioned in the input needs to do, not tasks for other people.
  6. If no task is assigned, or if the conversation is promotional, advertisement-related, or addressed to someone else, output exactly "Task not assigned".
  7. Do not prioritize or categorize the task.
  8. Do not include any additional information such as due dates or associated people.
  9. If multiple tasks are present, choose the most relevant or important one.
  10. Provide only the task description without any additional context or explanation.

  Remember, your response should be either "Task assigned : " followed by a single-line task description or "Task not assigned" if no relevant task is assigned for the name of the user mentioned!.
  `;
  const grammar = `
    root ::= ("Task not assigned" | "Task assigned : " single-line)
    single-line ::= [^\n.]+ ("." | "\n")
    `;

  const isDuplicateTask = async (task: string, sourceDocument: string) => {
    const closestTask = await Highlight.vectorDB.search(tableName, task, sourceDocument, 1);
    if (closestTask.length === 0) {
      console.log("No closest task found");
      return false;
    }
    console.log("Closest task", closestTask);
    if (Math.abs(closestTask[0].combinedSimilarity) > 0.90) {
      console.log("Duplicate task detected");
      return true
    }
    console.log("New task detected");
    return false;
  }

  useEffect(() => {
    const onPeriodicForegroundAppCheck = async (context: FocusedWindow) => {
      if (!slmCapable) {
        return;
      }
      console.log("context : ", context);
      // list of supported apps and urls
      const supportedApps = ["Slack", "Messages", "app.slack.com", "Outlook", "mail.google.com"];
      
      if (supportedApps.some(app => 
        context.appName === app || 
        (context.url && context.url.includes(app))
      )) {
        const now = Date.now();
        if (now - lastCallTime.current >= 30000) { // 30 seconds
          lastCallTime.current = now;
          console.log("Slack is open");
          const context = await Highlight.user.getContext(true)
          const user_prompt = "Name of the User : " + nameRef.current +  ".\nConversation : " + context.environment.ocrScreenContents;
          const slmTask = await Highlight.inference.getTextPredictionSlm(
            [{role: 'system', content: system_prompt},
             {role: 'user', content: user_prompt}],
            grammar);
          console.log('slmTask : ', slmTask);
          if (slmTask.startsWith("Task assigned : ")) {
            // Extract the task
            const taskText = slmTask.replace("Task assigned : ", "");

            if (await isDuplicateTask(taskText, user_prompt)) {
              return;
            }
            const generator = Highlight.inference.getTextPrediction(
              [{role: 'system', content: system_prompt},
               {role: 'user', content: user_prompt}]);
            let llmTask: string = '';

            for await (const part of generator) {
              llmTask += part;
            }
            console.log('llmTask : ', llmTask);
            // check if llmTask contains "Task not assigned" substring
            if (!llmTask.includes("Task not assigned") && /Task assigned\s*:\s*/.test(llmTask)) {
              // Use the regex to replace any variation of "Task assigned :" with an empty string
              const taskText = llmTask.replace(/Task assigned\s*:\s*/, "");
              if (!await isDuplicateTask(taskText, user_prompt)) {
                await addTask(taskText, user_prompt, 'automatically');
              }
            }
            await addTask(taskText, user_prompt, 'automatically', 'false_positive');
          }

        } else {
          // console.log("Throttled: Context fetch not allowed yet");
        }
      }
    };

    //let removeListener = Highlight.app.addListener("onContext", onContext);
    let removeListener = Highlight.app.addListener("onPeriodicForegroundAppCheck", onPeriodicForegroundAppCheck);

    return () => {
      removeListener();
    };
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const addTodo = async () => {
    if (newTodo.trim() === "") {
      return;
    }
    await addTask(newTodo, undefined, 'manually');
    setNewTodo("");
  }

  const updateTodo = async (id: string, text: string) => {
    const todo = todos.find(todo => todo.id === id);
    await Highlight.vectorDB.updateText(
      tableName,
      id,
      text,
      {
        status: todo?.status,
        additionMethod: todo?.additionMethod,
        lastModified: new Date().toISOString()
      }
    );
    loadTasks();
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find(todo => todo.id === id);
    const newStatus = todo?.status === 'completed' ? 'pending' : 'completed';
    await Highlight.vectorDB.updateMetadata(tableName, id,
      { status: newStatus,
        additionMethod: todo?.additionMethod,
        lastModified: new Date().toISOString() });
    loadTasks();
  }

  const toggleTodoWithFadeOut = async (id: string) => {
    // Find the todo item and update its 'fadingOut' state temporarily
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, fadingOut: true }; // Add a fadingOut property
      }
      return todo;
    });
    setTodos(updatedTodos);
    setTimeout(async () => {
      toggleTodo(id);
    }, 1000); // Delay of 1 second for the fade-out effect
  };

  const deleteTodo = async (id: string) => {
    const additionMethod = todos.find(todo => todo.id === id)?.additionMethod;
    if (additionMethod === 'automatically') {
      // For automatically added tasks, update the status to 'deleted' instead of deleting, so that we don't add it again
      await Highlight.vectorDB.updateMetadata(tableName, id,
        { status: 'deleted',
          additionMethod: additionMethod,
          lastModified: new Date().toISOString() });
    } else {
      await Highlight.vectorDB.deleteItem(tableName, id);
    }
    loadTasks();
  };

  const toggleHelp = async () => {
    await Highlight.appStorage.set("showHelpSection", !showHelpSection);
    setShowHelpSection(!showHelpSection);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-custom rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Todo List</h1>
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {isEditingName ? (
                  <div className="flex items-center">
                    <Input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="text-sm"
                    />
                    <Button
                      onClick={() => handleUserNameSave(userName)}
                      size="sm"
                      className="ml-2"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div
                    className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:underline"
                    onClick={handleUserNameEdit}
                  >
                    {name}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center mb-6">
              <Input
                type="text"
                placeholder="Add a new todo"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTodo()
                  }
                }}
                className="flex-grow"
              />
              <Button onClick={addTodo} className="ml-2">
                Add
              </Button>
            </div>
            
            <div className="space-y-2">
              {incompleteTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onCheckedChange={toggleTodoWithFadeOut}
                  onDelete={deleteTodo}
                  onUpdate={updateTodo}
                />
              ))}
            </div>
            
            <Collapsible
              open={showCompletedTodos}
              onOpenChange={() => setShowCompletedTodos(!showCompletedTodos)}
              className="mt-6"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <span>{showCompletedTodos ? "Hide Completed Items" : "Show Completed Items"}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${showCompletedTodos ? "transform rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {completedTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onCheckedChange={toggleTodo}
                    onDelete={deleteTodo}
                    onUpdate={updateTodo}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
        
        {showHelpSection && (
          <div className="mt-8 bg-white dark:bg-gray-800 shadow-custom rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">How to Use</h2>
                <button onClick={toggleHelp} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Semi Automatic</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>Press <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs">{hotKey}</kbd> while working on any application to add a new todo.</li>
                    <li>Use <kbd className="px-1 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs">Tab</kbd> key or click the dropdown to select <strong>Todo List</strong> app.</li>
                    <li>Click a suitable suggestion to add it to the <strong>Todo List</strong>.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Fully Automatic</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    {slmCapable ? (
                      <>
                        <li>We automatically add items to the <strong>Todo list</strong> based on your screen contents.</li>
                        <li>Ensure notifications are enabled for Highlight in your OS settings.</li>
                        <li>You&apos;ll receive a notification when an item is added to your <strong>Todo list</strong>.</li>
                        <li>Currently, fully automatic mode is supported only for Slack. Support for more apps coming soon.</li>
                      </>
                    ) : (
                      <li>Sorry. Your device does not support fully automatic task detection.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!showHelpSection && (
          <button
            onClick={toggleHelp}
            className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 p-2 rounded-full shadow-custom transition-colors"
          >
            <QuestionIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  )
}

function ChevronRightIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function ChevronDownIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function Trash2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19h0" />
      <path d="M9.09 9a3 3 0 0 1 5.83-1c.11.21.18.45.18.7 0 1.11-1.47 1.61-2.18 2.22-.52.45-.83.78-.83 1.36v.93" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}