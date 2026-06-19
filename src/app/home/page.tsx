"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle2,
  Circle,
  ListTodo,
  Loader2,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  due_date: string | null;
};

type TaskFilter = "all" | "open" | "completed";
type TaskUpdate = Partial<
  Pick<Task, "title" | "description" | "completed" | "due_date">
>;

const filters: { id: TaskFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "open", label: "Pendentes" },
  { id: "completed", label: "Concluídas" },
];

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const normalizeText = (value: string) => {
  return value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [search, setSearch] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadTasks = useCallback(async (currentUserId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setTasks(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (!session?.user) {
        router.replace("/auth/signin");
        return;
      }
      setUserId(session.user.id);
      void loadTasks(session.user.id);
    });
    return () => {
      active = false;
    };
  }, [loadTasks, router]);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim());
    return tasks
      .filter((task) => {
        if (filter === "open") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
      })
      .filter((task) => {
        if (!normalizedSearch) return true;
        const searchable = normalizeText(
          `${task.title} ${task.description ?? ""}`
        );
        return searchable.includes(normalizedSearch);
      });
  }, [tasks, filter, search]);

  const hasActiveSearch = search.trim().length > 0;

  const updateTask = useCallback(
    async (id: string, updates: TaskUpdate) => {
      if (!userId) {
        toast.error("Faça login novamente.");
        return null;
      }
      setSaving(true);
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return null;
      }

      if (data) {
        setTasks((cur) =>
          cur.map((t) => (t.id === id ? { ...t, ...data } : t))
        );
      }
      setSaving(false);
      return data;
    },
    [userId]
  );

  const handleCreateTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving || !userId) return;

    const nextTitle = title.trim();
    const nextDescription = description.trim() || null;
    const nextDue = dueDate ? dueDate : null;

    if (!nextTitle) {
      toast.error("Digite um título para a tarefa.");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: nextTitle,
        description: nextDescription,
        completed: false,
        due_date: nextDue,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    if (data) setTasks((cur) => [data, ...cur]);
    setTitle("");
    setDescription("");
    setDueDate("");
    setSaving(false);
    toast.success("Tarefa criada.");
  };

  const toggleTask = async (task: Task) => {
    const nextCompleted = !task.completed;
    const updated = await updateTask(task.id, { completed: nextCompleted });
    if (updated) {
      toast.success(nextCompleted ? "Tarefa concluída." : "Tarefa reaberta.");
    }
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description ?? "");
    setDueDate(task.due_date ? task.due_date.split("T")[0] : "");
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving || !editingTask) return;

    const nextTitle = title.trim();
    const nextDescription = description.trim() || null;
    const nextDue = dueDate ? dueDate : null;

    if (!nextTitle) {
      toast.error("Digite um título para a tarefa.");
      return;
    }

    const updated = await updateTask(editingTask.id, {
      title: nextTitle,
      description: nextDescription,
      due_date: nextDue,
    });

    if (!updated) return;
    setIsEditOpen(false);
    setEditingTask(null);
    toast.success("Tarefa atualizada.");
  };

  const handleDeleteTask = async () => {
    if (saving || !taskToDelete || !userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskToDelete.id)
      .eq("user_id", userId);
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    setTasks((cur) => cur.filter((t) => t.id !== taskToDelete.id));
    setSaving(false);
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
    toast.success("Tarefa removida.");
  };

  const emptyTitle = hasActiveSearch
    ? "Nenhuma tarefa encontrada"
    : filter === "completed"
    ? "Nenhuma tarefa concluída ainda"
    : filter === "open"
    ? "Tudo pendente por aqui"
    : "Sua lista está vazia";

  const emptyDescription = hasActiveSearch
    ? "Tente buscar por outro termo ou limpe a busca para ver todas as tarefas."
    : filter === "completed"
    ? "Conclua uma tarefa para vê-la nesta aba."
    : filter === "open"
    ? "Adicione uma nova tarefa para começar seu dia com foco."
    : "Use o formulário acima para criar sua primeira tarefa.";

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border border-white/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Nova tarefa</CardTitle>
            <CardDescription>
              Adicione um título, descrição opcional e um prazo (opcional).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="grid gap-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex.: Comprar mantimentos"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detalhes opcionais"
                      className="min-h-[44px] resize-none"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Prazo</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-indigo-600 px-6 hover:bg-indigo-700 sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-white/70 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b px-4 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <div>
              <CardTitle>Lista de tarefas</CardTitle>
              <CardDescription>
                Use o botão de lápis para editar e atualizar qualquer tarefa.
              </CardDescription>
            </div>

            <div className="grid gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por título ou descrição..."
                  className="pl-9"
                  type="search"
                  disabled={loading}
                />
              </div>

              {hasActiveSearch && (
                <p className="-mt-1 text-xs text-slate-500">
                  {visibleTasks.length}{" "}
                  {visibleTasks.length === 1 ? "resultado" : "resultados"}{" "}
                  encontrado{visibleTasks.length === 1 ? "" : "s"}.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={filter === item.id ? "outline" : "outline"}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "border-slate-200",
                  filter === item.id &&
                    "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
                )}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
              <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                <ListTodo className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{emptyTitle}</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-600">{emptyDescription}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleTasks.map((task) => (
                <article
                  key={task.id}
                  className={cn(
                    "rounded-2xl border p-4 transition hover:border-indigo-200 hover:shadow-sm",
                    task.completed && "bg-slate-50"
                  )}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void toggleTask(task)}
                        disabled={saving}
                        className={cn(
                          "rounded-full",
                          task.completed
                            ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            : "text-slate-400 hover:bg-indigo-50 hover:text-indigo-700"
                        )}
                        aria-label={
                          task.completed ? "Marcar como pendente" : "Marcar como concluída"
                        }
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </Button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={cn(
                              "text-base font-semibold leading-6 text-slate-900",
                              task.completed && "line-through text-slate-500"
                            )}
                          >
                            {task.title}
                          </h3>
                          <Badge
                            className={cn(
                              "border-0",
                              task.completed
                                ? "bg-lime-100 text-lime-800"
                                : "bg-orange-100 text-orange-800"
                            )}
                          >
                            {task.completed ? "Concluída" : "Pendente"}
                          </Badge>
                        </div>

                        {task.description && (
                          <p
                            className={cn(
                              "mt-1 text-sm",
                              task.completed ? "line-through text-slate-500" : "text-slate-600"
                            )}
                          >
                            {task.description}
                          </p>
                        )}

                        {task.due_date && (
                          <p className="mt-1 text-sm text-amber-600">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Prazo: {formatDate(task.due_date)}
                          </p>
                        )}

                        <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          Criada em {formatDate(task.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditTask(task)}
                        disabled={saving}
                        className="text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
                        aria-label={`Editar ${task.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setTaskToDelete(task);
                          setIsDeleteDialogOpen(true);
                        }}
                        disabled={saving}
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Excluir ${task.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <div className="mb-2 rounded-2xl bg-indigo-100 p-3 text-indigo-700">
                <Pencil className="h-6 w-6" />
              </div>
              <DialogTitle>Atualizar tarefa</DialogTitle>
              <DialogDescription>
                Edite título, descrição e prazo.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={saving}
                  placeholder="Título da tarefa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                  placeholder="Descrição opcional"
                  className="min-h-[96px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-due">Prazo</Label>
                <Input
                  id="edit-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setTaskToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a tarefa "{taskToDelete?.title}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir tarefa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
<dyad-write path="src/app/home/page.tsx" description="Ensuring file ends correctly after adding confirmation dialogs">
"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  CheckCircle2,
  Circle,
  ListTodo,
  Loader2,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  due_date: string | null;
};

type TaskFilter = "all" | "open" | "completed";
type TaskUpdate = Partial<
  Pick<Task, "title" | "description" | "completed" | "due_date">
>;

const filters: { id: TaskFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "open", label: "Pendentes" },
  { id: "completed", label: "Concluídas" },
];

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const normalizeText = (value: string) => {
  return value
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [search, setSearch] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadTasks = useCallback(async (currentUserId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setTasks(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (!session?.user) {
        router.replace("/auth/signin");
        return;
      }
      setUserId(session.user.id);
      void loadTasks(session.user.id);
    });
    return () => {
      active = false;
    };
  }, [loadTasks, router]);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.completed).length;
    return {
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
    };
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim());
    return tasks
      .filter((task) => {
        if (filter === "open") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
      })
      .filter((task) => {
        if (!normalizedSearch) return true;
        const searchable = normalizeText(
          `${task.title} ${task.description ?? ""}`
        );
        return searchable.includes(normalizedSearch);
      });
  }, [tasks, filter, search]);

  const hasActiveSearch = search.trim().length > 0;

  const updateTask = useCallback(
    async (id: string, updates: TaskUpdate) => {
      if (!userId) {
        toast.error("Faça login novamente.");
        return null;
      }
      setSaving(true);
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return null;
      }

      if (data) {
        setTasks((cur) =>
          cur.map((t) => (t.id === id ? { ...t, ...data } : t))
        );
      }
      setSaving(false);
      return data;
    },
    [userId]
  );

  const handleCreateTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving || !userId) return;

    const nextTitle = title.trim();
    const nextDescription = description.trim() || null;
    const nextDue = dueDate ? dueDate : null;

    if (!nextTitle) {
      toast.error("Digite um título para a tarefa.");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: nextTitle,
        description: nextDescription,
        completed: false,
        due_date: nextDue,
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    if (data) setTasks((cur) => [data, ...cur]);
    setTitle("");
    setDescription("");
    setDueDate("");
    setSaving(false);
    toast.success("Tarefa criada.");
  };

  const toggleTask = async (task: Task) => {
    const nextCompleted = !task.completed;
    const updated = await updateTask(task.id, { completed: nextCompleted });
    if (updated) {
      toast.success(nextCompleted ? "Tarefa concluída." : "Tarefa reaberta.");
    }
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description ?? "");
    setDueDate(task.due_date ? task.due_date.split("T")[0] : "");
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (saving || !editingTask) return;

    const nextTitle = title.trim();
    const nextDescription = description.trim() || null;
    const nextDue = dueDate ? dueDate : null;

    if (!nextTitle) {
      toast.error("Digite um título para a tarefa.");
      return;
    }

    const updated = await updateTask(editingTask.id, {
      title: nextTitle,
      description: nextDescription,
      due_date: nextDue,
    });

    if (!updated) return;
    setIsEditOpen(false);
    setEditingTask(null);
    toast.success("Tarefa atualizada.");
  };

  const handleDeleteTask = async () => {
    if (saving || !taskToDelete || !userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskToDelete.id)
      .eq("user_id", userId);
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    setTasks((cur) => cur.filter((t) => t.id !== taskToDelete.id));
    setSaving(false);
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
    toast.success("Tarefa removida.");
  };

  const emptyTitle = hasActiveSearch
    ? "Nenhuma tarefa encontrada"
    : filter === "completed"
    ? "Nenhuma tarefa concluída ainda"
    : filter === "open"
    ? "Tudo pendente por aqui"
    : "Sua lista está vazia";

  const emptyDescription = hasActiveSearch
    ? "Tente buscar por outro termo ou limpe a busca para ver todas as tarefas."
    : filter === "completed"
    ? "Conclua uma tarefa para vê-la nesta aba."
    : filter === "open"
    ? "Adicione uma nova tarefa para começar seu dia com foco."
    : "Use o formulário acima para criar sua primeira tarefa.";

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border border-white/70 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Nova tarefa</CardTitle>
            <CardDescription>
              Adicione um título, descrição opcional e um prazo (opcional).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="grid gap-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex.: Comprar mantimentos"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detalhes opcionais"
                      className="min-h-[44px] resize-none"
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Prazo</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-indigo-600 px-6 hover:bg-indigo-700 sm:w-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Adicionar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-white/70 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b px-4 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-4">
            <div>
              <CardTitle>Lista de tarefas</CardTitle>
              <CardDescription>
                Use o botão de lápis para editar e atualizar qualquer tarefa.
              </CardDescription>
            </div>

            <div className="grid gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por título ou descrição..."
                  className="pl-9"
                  type="search"
                  disabled={loading}
                />
              </div>

              {hasActiveSearch && (
                <p className="-mt-1 text-xs text-slate-500">
                  {visibleTasks.length}{" "}
                  {visibleTasks.length === 1 ? "resultado" : "resultados"}{" "}
                  encontrado{visibleTasks.length === 1 ? "" : "s"}.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={filter === item.id ? "outline" : "outline"}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "border-slate-200",
                  filter === item.id &&
                    "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
                )}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl border p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
              <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
                <ListTodo className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{emptyTitle}</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-600">{emptyDescription}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleTasks.map((task) => (
                <article
                  key={task.id}
                  className={cn(
                    "rounded-2xl border p-4 transition hover:border-indigo-200 hover:shadow-sm",
                    task.completed && "bg-slate-50"
                  )}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void toggleTask(task)}
                        disabled={saving}
                        className={cn(
                          "rounded-full",
                          task.completed
                            ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                            : "text-slate-400 hover:bg-indigo-50 hover:text-indigo-700"
                        )}
                        aria-label={
                          task.completed ? "Marcar como pendente" : "Marcar como concluída"
                        }
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </Button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={cn(
                              "text-base font-semibold leading-6 text-slate-900",
                              task.completed && "line-through text-slate-500"
                            )}
                          >
                            {task.title}
                          </h3>
                          <Badge
                            className={cn(
                              "border-0",
                              task.completed
                                ? "bg-lime-100 text-lime-800"
                                : "bg-orange-100 text-orange-800"
                            )}
                          >
                            {task.completed ? "Concluída" : "Pendente"}
                          </Badge>
                        </div>

                        {task.description && (
                          <p
                            className={cn(
                              "mt-1 text-sm",
                              task.completed ? "line-through text-slate-500" : "text-slate-600"
                            )}
                          >
                            {task.description}
                          </p>
                        )}

                        {task.due_date && (
                          <p className="mt-1 text-sm text-amber-600">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Prazo: {formatDate(task.due_date)}
                          </p>
                        )}

                        <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5" />
                          Criada em {formatDate(task.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditTask(task)}
                        disabled={saving}
                        className="text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
                        aria-label={`Editar ${task.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setTaskToDelete(task);
                          setIsDeleteDialogOpen(true);
                        }}
                        disabled={saving}
                        className="text-red-500 hover:bg-red-50 hover:text-red-700"
                        aria-label={`Excluir ${task.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingTask(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <div className="mb-2 rounded-2xl bg-indigo-100 p-3 text-indigo-700">
                <Pencil className="h-6 w-6" />
              </div>
              <DialogTitle>Atualizar tarefa</DialogTitle>
              <DialogDescription>
                Edite título, descrição e prazo.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={saving}
                  placeholder="Título da tarefa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={saving}
                  placeholder="Descrição opcional"
                  className="min-h-[96px] resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-due">Prazo</Label>
                <Input
                  id="edit-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setTaskToDelete(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a tarefa "{taskToDelete?.title}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir tarefa"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}