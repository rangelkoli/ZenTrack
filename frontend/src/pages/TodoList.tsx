import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { set } from "date-fns";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface UserTasks {
  user_id: number;
  tasks: Task[];
  date: string;
}

const TodoList = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const prevDay = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
  };

  const nextDay = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
  };

  const [newTodo, setNewTodo] = useState("");
  const [userTodos, setUserTodos] = useState<UserTasks[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/tasks/get_tasks/1").then((response) => {
      console.log(response.data);
      setUserTodos(response.data);
    });
  }, []);

  useEffect(() => {
    const filteredTasks = userTodos.find(
      (data) => data.date === currentDate.toISOString().split("T")[0]
    )?.tasks;
    setTodos(filteredTasks || []);
  }, [currentDate, userTodos]);

  const addTodo = () => {
    console.log(newTodo);
    if (newTodo.trim() === "") {
      return;
    }

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
    };

    const updatedTodos = todos.map((todo) => ({ ...todo }));
    const currentDateTasks = userTodos.find(
      (data) => data.date === currentDate.toISOString().split("T")[0]
    );

    if (currentDateTasks) {
      console.log("currentDateTasks", currentDateTasks);
      currentDateTasks.tasks.push(todo);
    } else {
      console.log("currentDateTasks Not found", currentDateTasks);
      userTodos.push({
        user_id: 1,
        tasks: [todo],
        date: currentDate.toISOString().split("T")[0],
      });
    }

    setTodos(updatedTodos);
    setNewTodo("");

    setUserTodos([...userTodos]); // Update userTodos state

    console.log(userTodos);
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <Card className='h-full p-10'>
      <CardHeader>
        <CardTitle className='flex justify-between items-center'>
          <Button variant='outline' size='icon' onClick={prevDay}>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <span className='text-lg'>
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <Button variant='outline' size='icon' onClick={nextDay}>
            <ChevronRight className='h-4 w-4' />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col sm:flex-row gap-2 mb-4'>
          <Input
            type='text'
            placeholder='Add a new task'
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className='flex-grow'
          />
          <Button onClick={addTodo} className='w-full sm:w-auto'>
            Add
          </Button>
        </div>
        <ul className='space-y-2'>
          {todos.map((todo) => (
            <li key={todo.id} className='flex items-center'>
              <Checkbox
                id={todo.id}
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
              />
              <label
                htmlFor={todo.id}
                className={`ml-2 ${
                  todo.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {todo.text}
              </label>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default TodoList;
