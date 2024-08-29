import { Todo } from "@/components/todo"
import { Welcome } from "@/components/welcome"
import { useName } from './providers/NameProvider'; // Adjust the path based on where you save the context

export function Home() {
    const { name } = useName();

    return !name ? <Welcome /> : <Todo/>;
}

