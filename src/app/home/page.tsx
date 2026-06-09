"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, Circle, Plus, Filter, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
}

type FilterOption = "all" | "completed" | "pending";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [filter, setFilter] = useState<FilterOption>("all");

  // Sessão
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push("/auth/signin");
      } else {
        setUser(session.user);
        fetchTasks(session.user.id);
        setLoading(false);
      }
    };
    getSession();
  }, [router]);

  // Busca de tarefas
  const fetchTasks = async (userId: string) => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching tasks:", error);
    else setTasks(data || []);
  };

  // Adicionar tarefa
  const addTask = async () => {
    if (!newTask.title.trim()) return;
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: newTask.title,
        description: newTask.description,
        user_id: user.id,
        completed: false,
      })
      .select()
      .single();

    if (error) console.error("Error adding task:", error);
    else {
      setTasks([data, ...tasks]);
      setNewTask({ title: "", description: "" });
    }
  };

  // Alternar status
  const toggleTask = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed })
      .eq("id", taskId);

    if (error) console.error("Error updating task:", error);
    else setTasks(tasks.map(t => (t.id === taskId ? { ...t, completed } : t)));
  };

  // Excluir tarefa
  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) console.error("Error deleting task:", error);
    else setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Filtrar tarefas
  const filteredTasks = tasks.filter(t => {
    if (filter === "all") return true;
    if (filter === "completed") return t.completed;
    return !t.completed;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Minhas Tarefas</h1>
            <p className="text-gray-600">Olá, {user?.email}</p>
          </div>
        </header>

        {/* Novo formulário */}
        <Card className="mb-8 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Adicionar Nova Tarefa</CardTitle>
            <CardDescription>Crie uma nova tarefa para organizar seu dia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Título da tarefa"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
            <Input
              placeholder="Descrição (opcional)"
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            />
            <Button onClick={addTask} className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Tarefa
            </Button>
          </CardContent>
        </Card>

        {/* Filtros */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Todas
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("pending")}
          >
            Pendentes
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Concluídas
          </Button>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className="ml-auto text-gray-500 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Lista de tarefas */}
        {filteredTasks.length === 0 ? (
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-4">Nenhuma tarefa encontrada</p>
              <p className="text-sm text-gray-400">Adicione sua primeira tarefa acima!</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <Card key={task.id} className="bg-white shadow-md hover:shadow-lg transition-shadow mb-4">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <button onClick={() => toggleTask(task.id, !task.completed)} className="focus:outline-none">
                    {task.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                  <div>
                    <h3 className={`font-semibold ${task.completed ? "line-through text-gray-500" : "text-gray-800"}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`text-sm ${task.completed ? "text-gray-400" : "text-gray-600"}`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center mt-1 space-x-2">
                      <Badge variant={task.completed ? "default" : "secondary"}>
                        {task.completed ? "Concluída" : "Pendente"}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}