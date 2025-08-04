import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, name, organizationName, telefone);
    
    // Note: With email confirmation enabled, user won't be automatically signed in
    // They need to verify their email first
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Card de Recomendações */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          ⚠️ <span className="ml-2">IMPORTANTE - Leia antes de continuar</span>
        </h3>
        <div className="space-y-3 text-sm">
          <div className="bg-white/70 rounded-md p-3 border-l-4 border-blue-500">
            <p className="text-blue-800">
              <strong>📧 E-mail:</strong> Use o mesmo e-mail que você utilizou na compra da Mia.<br/>
              Caso contrário, você não conseguirá ativar sua conta.
            </p>
          </div>
          <div className="bg-white/70 rounded-md p-3 border-l-4 border-red-500">
            <p className="text-red-800">
              <strong>📱 WhatsApp:</strong> Digite apenas números corridos (DDD + 9 + número).<br/>
              Exemplo: 11987654321<br/>
              <span className="font-semibold">⚠️ Se não seguir este padrão, a Mia não funcionará no WhatsApp! Não use espaços, parênteses (), traços -, +55 ou outros símbolos.</span>
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome completo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizationName">Nome da organização</Label>
          <Input
            id="organizationName"
            type="text"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="Nome da sua empresa ou seu apelido"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">WhatsApp</Label>
          <Input
            id="telefone"
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="61900000000 (exemplo)"
            required
          />
          <p className="text-xs text-gray-500">
            <span className="text-indigo-600 font-medium">61</span><span className="text-green-600 font-medium">9</span><span className="text-orange-600 font-medium">00000000</span> (DDD + dígito 9 + número)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Use o mesmo e-mail da compra"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a mesma senha novamente"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-500 hover:bg-purple-600"
          disabled={isLoading}
        >
          {isLoading ? "Criando conta..." : "Criar conta"}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-purple-600 hover:text-purple-500 font-medium"
            >
              Faça login
            </button>
          </span>
        </div>
      </form>
    </div>
  );
};