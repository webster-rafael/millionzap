/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { CreateCompanyFormSchema } from "@/validations/loginSchema";
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function CadastrarContent() {
  const { signUpUser, isSigningUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof CreateCompanyFormSchema>>({
    resolver: zodResolver(CreateCompanyFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      plan: "",
    },
  });

  function onSubmit(values: z.infer<typeof CreateCompanyFormSchema>) {
    const payload = {
      name: values.name,
      phone: values.phone,
      email: values.email,
      password: values.password,
      planId: values.plan,
    };

    signUpUser(payload, {
      onSuccess: () => {
        toast.success("Empresa criada com sucesso!");
        navigate("/entrar");
        form.reset();
      },
      onError: (error: any) => {
        if (error?.code === "P2002") {
          toast.error("Este e-mail já está cadastrado.");
        } else {
          toast.error("Não foi possível criar a empresa.");
        }
      },
    });
  }

  return (
    <main className="grid h-dvh w-full grid-cols-1 lg:grid-cols-2">
      <div className="bg-primary-million absolute inset-0 flex items-center justify-center lg:static">
        <img
          className="h-96 w-96"
          src="/milliontech.png"
          alt="Banner Milliontech"
        />
        <div className="absolute inset-0 bg-black opacity-50 lg:hidden"></div>
      </div>
      <div className="z-10 flex items-center justify-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="lg:3/5 w-4/5 space-y-8 rounded-md border bg-zinc-100 p-4 shadow-2xl lg:bg-none 2xl:w-1/3"
          >
            <div>
              <h1 className="text-secondary-million font-poppins text-center text-2xl font-semibold">
                Crie sua empresa
              </h1>
              <p className="hidden text-center text-xs text-gray-500 lg:block">
                Cadastre sua empresa e comece a gerenciar seus leads com nosso
                CRM inteligente.
              </p>
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome da empresa..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu número..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Planos</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plano1">Plano 1</SelectItem>
                        <SelectItem value="plano2">Plano 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-full lg:w-auto"
              type="submit"
              disabled={isSigningUp}
            >
              {isSigningUp ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </form>
        </Form>
        <Toaster />
      </div>
    </main>
  );
}
