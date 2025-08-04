import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  TrendingUp,
  TrendingDown,
  FileText,
  BarChart3,
  Tag,
  PieChart,
  Target,
  Users,
  Bot,
  ShoppingCart,
  Car,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: TrendingUp, label: "Receitas", path: "/receitas" },
    { icon: TrendingDown, label: "Despesas", path: "/despesas" },
    { icon: FileText, label: "Transações", path: "/transacoes" },
    { icon: PieChart, label: "Dívidas", path: "/dividas" },
    { icon: Tag, label: "Categorias", path: "/categorias" },
    { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
    { icon: Target, label: "Metas", path: "/metas" },
    { icon: Users, label: "Perfil", path: "/perfil" },
  ];

  const handleLogout = () => {
    // Limpar dados de autenticação do localStorage
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("isAuthenticated");

    // Mostrar toast de confirmação
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });

    // Redirecionar para a página inicial (login)
    navigate("/");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Encontrar os itens principais para o menu inferior
  const dashboardItem = menuItems.find(item => item.path === "/dashboard");
  const transacoesItem = menuItems.find(item => item.path === "/transacoes");

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Desktop Sidebar */}
      <div
        className={`
          hidden lg:flex fixed top-0 left-0 h-screen
          transition-all duration-300
          bg-white border-r border-gray-200 flex-col
          z-40
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-center w-full">
            <img
              src="https://i.imgur.com/8WdfAs3.png"
              alt="Logo Mia"
              className={`
                rounded-lg object-cover transition-all duration-300
                ${isCollapsed ? "h-10 w-10" : "h-40 w-40"}
              `}
            />
          </div>
        </div>

        {/* Collapse Button - Desktop only */}
        <Button
          variant="ghost"
          size="icon"
          className={`
            absolute top-6 -right-3
            h-6 w-6 rounded-full bg-white border border-gray-300
            hover:bg-gray-100 hover:border-gray-400
            transition-all duration-200 shadow-sm
            flex items-center justify-center
          `}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-gray-600" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-gray-600" />
          )}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? "bg-purple-100 text-purple-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                } ${isCollapsed ? "justify-center" : "space-x-3"}`}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Button
            variant="ghost"
            className={`w-full text-gray-600 hover:text-gray-900 ${
              isCollapsed ? "justify-center px-0" : "justify-start"
            }`}
            onClick={handleLogout}
            title={isCollapsed ? "Sair" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">Sair</span>}
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-white border border-gray-200 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.25)] backdrop-blur-sm rounded-2xl">
        <div className="flex items-center justify-between px-4 py-4">
          {/* Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center justify-center p-3 min-w-[60px] h-16 rounded-xl transition-all ${
              isMobileMenuOpen ? "bg-purple-100 text-purple-600" : "text-gray-600"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
            <span className="text-xs mt-1">Menu</span>
          </Button>

          {/* Dashboard Button */}
          {dashboardItem && (
            <Link
              to={dashboardItem.path}
              onClick={() => {
                if (isMobileMenuOpen) {
                  closeMobileMenu();
                } else if (location.pathname === dashboardItem.path) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`flex flex-col items-center justify-center p-3 min-w-[60px] h-16 rounded-xl transition-all ${
                location.pathname === dashboardItem.path
                  ? "bg-purple-100 text-purple-600"
                  : "text-gray-600"
              }`}
            >
              <dashboardItem.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{dashboardItem.label}</span>
            </Link>
          )}

          {/* Transações Button */}
          {transacoesItem && (
            <Link
              to={transacoesItem.path}
              onClick={() => {
                if (isMobileMenuOpen) {
                  closeMobileMenu();
                }
              }}
              className={`flex flex-col items-center justify-center p-3 min-w-[60px] h-16 rounded-xl transition-all ${
                location.pathname === transacoesItem.path
                  ? "bg-purple-100 text-purple-600"
                  : "text-gray-600"
              }`}
            >
              <transacoesItem.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{transacoesItem.label}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Full Screen Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMobileMenu}
          ></div>

          {/* Full Screen Menu */}
          <div className="lg:hidden fixed inset-0 bg-white z-40 flex flex-col pb-24">
            {/* Header with logo centered */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1"></div>
              <div className="flex flex-col items-center">
                <img
                  src="https://i.imgur.com/8WdfAs3.png"
                  alt="Logo Mia"
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <h2 className="mt-2 text-lg font-semibold text-gray-900">Menu</h2>
              </div>
              <div className="flex-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 bg-purple-100 hover:bg-purple-200 text-purple-600"
                  onClick={closeMobileMenu}
                >
                  <X className="h-7 w-7" />
                </Button>
              </div>
            </div>

            {/* Navigation Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                      location.pathname === item.path
                        ? "bg-purple-50 border-purple-200 text-purple-600"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-8 h-8 mb-3" />
                    <span className="text-sm font-medium text-center">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <div className="p-6 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center py-3 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-64"
        } transition-all duration-300 pb-28 lg:pb-0`}
      >
        {/* Mobile Header with Logo */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex justify-center">
          <img
            src="https://i.imgur.com/8WdfAs3.png"
            alt="Logo Mia"
            className="h-12 w-12 rounded-lg object-cover"
          />
        </div>
        {children}
      </div>
    </div>
  );
};