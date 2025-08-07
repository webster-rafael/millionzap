/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Eye, EyeClosed } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@/validations/loginSchema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function EntrarContent() {
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleLogin(values: z.infer<typeof loginSchema>) {
    loginUser(values, {
      onSuccess: () => {
        toast.success("Login realizado com sucesso!");
        navigate("/");
      },
      onError: (error) => {
        toast.error(error.message || "E-mail ou senha inválidos.");
      },
    });
  }

  return (
    <main className="grid h-dvh w-full grid-cols-2">
      <div className="bg-primary-million flex items-center justify-center">
        <img
          className="h-96 w-96"
          src="/milliontech.png"
          alt="Banner Milliontech"
        />
      </div>
      <div className="flex flex-col items-center justify-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleLogin)}
            className="w-3/5 space-y-8 rounded-md border p-4 shadow-2xl 2xl:w-1/3"
          >
            <h2 className="text-center text-2xl font-bold">Acessar Conta</h2>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="exemplo@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha..."
                        {...field}
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 hover:text-zinc-800"
                    >
                      {showPassword ? (
                        <Eye size={20} />
                      ) : (
                        <EyeClosed size={20} />
                      )}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoggingIn} className="w-full">
              {isLoggingIn ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>
        <p className="mt-4">
          Não tem uma conta?{" "}
          <a href="/cadastrar" className="text-primary hover:underline">
            Cadastre-se
          </a>
        </p>
        <Toaster />
      </div>
    </main>
  );
}
