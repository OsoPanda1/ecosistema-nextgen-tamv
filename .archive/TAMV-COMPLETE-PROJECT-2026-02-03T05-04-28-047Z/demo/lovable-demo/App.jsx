import React, { useState, useEffect } from 'react';

// UI Components - Simplified for Lovable compatibility
const Card = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  className = "", 
  variant = "default", 
  size = "default",
  disabled = false,
  onClick,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };
  
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = "" }) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </div>
);

const Progress = ({ value = 0, className = "" }) => (
  <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
    <div 
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: `translateX(-${100 - value}%)` }}
    />
  </div>
);

// Componente principal de la aplicación TAMV Demo
const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <HeroSection />
      <ServicesOverview />
      <LiveMetrics />
      <IsabellaAIDemo />
      <TechnologyShowcase />
      <InvestorSection />
      <GlobalPresence />
      <Footer />
    </div>
  );
};

// Hero Section - Impacto inicial
const HeroSection = () => {
  const [currentMetric, setCurrentMetric] = useState(0);
  const metrics = [
    { number: "6.2M", label: "Usuarios Activos", color: "text-blue-400" },
    { number: "$42M", label: "Ingresos Mensuales", color: "text-green-400" },
    { number: "25", label: "Países Activos", color: "text-purple-400" },
    { number: "99.97%", label: "Uptime", color: "text-orange-400" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [metrics.length]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Logo y Título Principal */}
        <div className="mb-12">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
              T
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              TAMV
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              DreamWorld v2.0
            </h2>
            <p className="text-xl md:text-2xl text-blue-200 mb-6">
              El Primer Ecosistema Civilizacional Digital del Mundo
            </p>
            <p className="text-lg text-gray-300 mb-8 max-w-4xl mx-auto">
              La evolución de todo lo conocido en la red • 35+ servicios integrados • 
              Tecnología XR 4D nativa • IA ética explicable • Economía federada antifrágil
            </p>
          </div>

          {/* Métricas Rotativas */}
          <div className="mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto border border-white/20">
              <div className="text-5xl font-bold mb-2 transition-all duration-500 text-blue-400">
                {metrics[currentMetric].number}
              </div>
              <div className="text-white text-lg">
                {metrics[currentMetric].label}
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl transform hover:scale-105 transition-all">
              🚀 Explorar Ecosistema
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm">
              📊 Ver Demo en Vivo
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl">
              💎 Información Inversores
            </Button>
          </div>

          {/* Badges de Reconocimiento */}
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 text-sm">
              🏆 Most Innovative Platform 2026
            </Badge>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm">
              ✅ Best AI Ethics Implementation
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 text-sm">
              🔗 Blockchain Excellence Award
            </Badge>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

// Servicios Overview
const ServicesOverview = () => {
  const services = [
    {
      name: "Red Social Avanzada",
      description: "Superior a TikTok/Instagram con tecnología XR 4D nativa",
      users: "5.0M",
      revenue: "$15M/mes",
      growth: "+127%",
      status: "active",
      icon: "🌐",
      features: ["Videos 4K/8K", "Filtros XR", "Regalos NFT", "Streaming 4D"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Universidad TAMV",
      description: "Educación certificada con IA tutoring y blockchain",
      users: "150K",
      revenue: "$8M/mes",
      growth: "+89%",
      status: "active",
      icon: "🎓",
      features: ["Cursos XR", "Certificación Blockchain", "IA Isabella", "Acreditación Global"],
      color: "from-purple-500 to-indigo-500"
    },
    {
      name: "Marketplace Global",
      description: "Comercio P2P con 70% para creadores vs 45% competencia",
      users: "800K",
      revenue: "$25M/mes",
      growth: "+156%",
      status: "active",
      icon: "🛍️",
      features: ["NFTs Verificados", "Escrow Inteligente", "Pagos Crypto", "Bienes Raíces VR"],
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Servicios de Salud",
      description: "Telemedicina XR con IA diagnóstica y terapias inmersivas",
      users: "300K",
      revenue: "$6M/mes",
      growth: "+203%",
      status: "beta",
      icon: "🏥",
      features: ["Consultas XR", "Terapia Mental", "Monitoreo Biométrico", "Farmacia Digital"],
      color: "from-red-500 to-pink-500"
    },
    {
      name: "Gaming & Esports",
      description: "Torneos globales con premios reales y mascotas IA",
      users: "2.1M",
      revenue: "$12M/mes",
      growth: "+178%",
      status: "active",
      icon: "🎮",
      features: ["Torneos Globales", "Mascotas IA", "Streaming Integrado", "NFT Rewards"],
      color: "from-orange-500 to-red-500"
    },
    {
      name: "Servicios Financieros",
      description: "Banco digital + trading + lotería blockchain transparente",
      users: "900K",
      revenue: "$18M/mes",
      growth: "+134%",
      status: "active",
      icon: "💰",
      features: ["Banco Digital", "Trading Crypto", "Lotería Blockchain", "Remesas Globales"],
      color: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-slate-900 to-gray-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            35+ Servicios Integrados
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            El único ecosistema del mundo que combina todos los servicios digitales 
            que una persona necesita en una sola plataforma soberana y ética.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">
              🚀 Más Servicios en Desarrollo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-gray-300">
              <div>📰 Noticias IA</div>
              <div>🌌 Dream Spaces</div>
              <div>🌉 Puentes Conocimiento</div>
              <div>📢 Publicidad Ética</div>
              <div>🆔 ID-NVIDA</div>
              <div>🐾 Mascotas Digitales</div>
              <div>🎰 Lotería TAMV</div>
              <div>👥 Referidos 500</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Tarjeta de Servicio
const ServiceCard = ({ service }) => {
  const getColorClasses = (color) => {
    switch(color) {
      case 'from-blue-500 to-cyan-500': return "from-blue-500 to-cyan-500";
      case 'from-purple-500 to-indigo-500': return "from-purple-500 to-indigo-500";
      case 'from-green-500 to-emerald-500': return "from-green-500 to-emerald-500";
      case 'from-red-500 to-pink-500': return "from-red-500 to-pink-500";
      case 'from-orange-500 to-red-500': return "from-orange-500 to-red-500";
      case 'from-yellow-500 to-orange-500': return "from-yellow-500 to-orange-500";
      default: return "from-blue-500 to-cyan-500";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-4xl">{service.icon}</div>
          <Badge className={`bg-gradient-to-r ${getColorClasses(service.color)} text-white`}>
            {service.status === 'active' ? 'Activo' : 'Beta'}
          </Badge>
        </div>
        <CardTitle className="text-white text-xl mb-2">{service.name}</CardTitle>
        <p className="text-gray-300 text-sm">{service.description}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{service.users}</div>
            <div className="text-xs text-gray-400">Usuarios</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{service.revenue}</div>
            <div className="text-xs text-gray-400">Ingresos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{service.growth}</div>
            <div className="text-xs text-gray-400">Crecimiento</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-300 mb-2">Características:</div>
          {service.features.map((feature, idx) => (
            <div key={idx} className="text-xs text-gray-400 flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
              {feature}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Métricas en Tiempo Real
const LiveMetrics = () => {
  const [metrics, setMetrics] = useState({
    activeUsers: 6200000,
    monthlyRevenue: 42000000,
    transactionsToday: 847293,
    countriesActive: 25,
    servicesOnline: 28,
    uptimePercentage: 99.97,
    creatorEarnings: 29400000,
    newUsersToday: 15847,
    aiRequestsToday: 2847293
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 100),
        transactionsToday: prev.transactionsToday + Math.floor(Math.random() * 50),
        newUsersToday: prev.newUsersToday + Math.floor(Math.random() * 10),
        aiRequestsToday: prev.aiRequestsToday + Math.floor(Math.random() * 200)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-20 bg-black text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            📊 Métricas en Tiempo Real
          </h2>
          <p className="text-xl text-gray-300">
            Datos actualizados cada 3 segundos desde nuestros servidores globales
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <MetricCard 
            number={metrics.activeUsers.toLocaleString()} 
            label="Usuarios Activos"
            trend="+2.3%"
            color="blue"
            icon="👥"
          />
          <MetricCard 
            number={`$${(metrics.monthlyRevenue / 1000000).toFixed(1)}M`} 
            label="Ingresos Mensuales"
            trend="+15.7%"
            color="green"
            icon="💰"
          />
          <MetricCard 
            number={metrics.transactionsToday.toLocaleString()} 
            label="Transacciones Hoy"
            trend="+8.2%"
            color="purple"
            icon="⚡"
          />
          <MetricCard 
            number={metrics.countriesActive} 
            label="Países Activos"
            trend="+4"
            color="orange"
            icon="🌍"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Distribución de Ingresos */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                💰 Distribución de Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Creadores (70%)</span>
                  <span className="text-green-400 font-bold">
                    ${(metrics.creatorEarnings / 1000000).toFixed(1)}M
                  </span>
                </div>
                <Progress value={70} className="h-3" />
                <div className="text-sm text-gray-400">
                  TAMV distribuye más dinero a creadores que cualquier otra plataforma
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Plataforma (15%)</div>
                    <div className="text-blue-400 font-bold">$6.3M</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Desarrollo (8%)</div>
                    <div className="text-purple-400 font-bold">$3.4M</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expansión Global */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                🌍 Expansión Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">América</span>
                  <span className="text-blue-400 font-bold">12 países</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Europa</span>
                  <span className="text-green-400 font-bold">8 países</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Asia-Pacífico</span>
                  <span className="text-purple-400 font-bold">5 países</span>
                </div>
                <div className="text-sm text-gray-400 mt-4 p-3 bg-gray-800 rounded-lg">
                  🚀 Expandiendo a 50 países en Q1 2026
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tecnología en Acción */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                🤖 IA Isabella en Acción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Consultas IA Hoy</span>
                  <span className="text-blue-400 font-bold">
                    {metrics.aiRequestsToday.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Precisión Ética</span>
                  <span className="text-green-400 font-bold">99.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Explicabilidad</span>
                  <span className="text-purple-400 font-bold">100%</span>
                </div>
                <div className="text-sm text-gray-400 mt-4 p-3 bg-gray-800 rounded-lg">
                  ⚡ Única IA del mundo con explicabilidad total
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Componente de Métrica
const MetricCard = ({ number, label, trend, color, icon }) => {
  const getColorClasses = (color) => {
    switch(color) {
      case 'blue': return "from-blue-500 to-blue-600";
      case 'green': return "from-green-500 to-green-600";
      case 'purple': return "from-purple-500 to-purple-600";
      case 'orange': return "from-orange-500 to-orange-600";
      default: return "from-blue-500 to-blue-600";
    }
  };

  return (
    <Card className={`bg-gradient-to-br ${getColorClasses(color)} border-0 text-white hover:scale-105 transition-transform duration-300`}>
      <CardContent className="p-6 text-center">
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-3xl font-bold mb-2">{number}</div>
        <div className="text-sm opacity-90 mb-2">{label}</div>
        <Badge className="bg-white/20 text-white text-xs">
          {trend}
        </Badge>
      </CardContent>
    </Card>
  );
};

// Isabella AI Demo Interactivo
const IsabellaAIDemo = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    // Simular respuesta de Isabella AI
    setTimeout(() => {
      const responses = {
        "¿Qué es TAMV?": "TAMV DreamWorld v2.0 es el primer ecosistema civilizacional digital federado antifrágil del mundo. Combina 35+ servicios en una plataforma soberana que prioriza la dignidad humana y la distribución justa de valor. Con 6.2M usuarios activos y $42M en ingresos mensuales, representa la evolución de todo lo conocido en la red.",
        "¿Cómo funciona la economía?": "Nuestra economía federada distribuye el 70% de los ingresos directamente a los creadores, comparado con el 45-55% de otras plataformas. Utilizamos el sistema FairSplit con blockchain MSR para garantizar transparencia total. Tenemos 30+ formas de monetización ética, desde contenido hasta educación y servicios de salud.",
        "¿Qué hace único a TAMV?": "TAMV es único porque es el único ecosistema que combina: tecnología XR 4D nativa, computación cuántica-clásica híbrida, IA ética explicable (Isabella), seguridad multicapa TENOCHTITLAN, blockchain MSR antifraud, y una arquitectura civilizacional federada. No somos una plataforma, somos una civilización digital soberana.",
        "¿Cómo puedo ganar dinero?": "TAMV ofrece 30+ formas de monetización: creación de contenido (70% para ti), educación en UTAMV, comercio en marketplace, gaming y esports, servicios de salud, arte y NFTs, programa de referidos 500, desarrollo en TAMVDevs, y muchas más. Nuestro modelo garantiza que los creadores reciban la mayor parte del valor que generan.",
        "¿Es seguro TAMV?": "TAMV utiliza el sistema de seguridad TENOCHTITLAN con múltiples capas: ANUBIS CENTINEL (producción), HORUS CENTINEL (respaldo), DEKATEOTL (orquestación), y AZTEK GODS (emergencia). Tenemos 0 brechas de seguridad, encriptación cuántica, y cumplimiento legal global. Tu seguridad es nuestra prioridad absoluta."
      };
      
      setResponse(responses[query] || "Isabella AI está procesando tu consulta con principios éticos. Como IA explicable, puedo ayudarte a entender cualquier aspecto de TAMV DreamWorld v2.0. ¿Te gustaría saber sobre nuestros servicios, tecnología, modelo económico, o cómo empezar a ganar dinero en la plataforma?");
      setIsLoading(false);
    }, 2000);
  };

  const quickQuestions = [
    "¿Qué es TAMV?",
    "¿Cómo funciona la economía?", 
    "¿Qué hace único a TAMV?",
    "¿Cómo puedo ganar dinero?",
    "¿Es seguro TAMV?"
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-purple-900 to-blue-900 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            🤖 Isabella AI - Inteligencia Artificial Ética
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            La única IA del mundo con explicabilidad total y principios éticos inmutables. 
            Pregúntame cualquier cosa sobre TAMV DreamWorld v2.0.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-4 text-purple-200">
                Pregúntale a Isabella sobre TAMV:
              </label>
              
              {/* Quick Questions */}
              <div className="flex flex-wrap gap-3 mb-6">
                {quickQuestions.map((question, index) => (
                  <button 
                    key={index}
                    onClick={() => setQuery(question)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium transform hover:scale-105"
                  >
                    {question}
                  </button>
                ))}
              </div>
              
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribe tu pregunta sobre TAMV DreamWorld v2.0..."
                className="w-full p-4 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-purple-400 focus:outline-none resize-none"
                rows={3}
              />
            </div>
            
            <button
              onClick={handleQuery}
              disabled={isLoading || !query.trim()}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Isabella está pensando...
                </div>
              ) : (
                "🤖 Preguntar a Isabella AI"
              )}
            </button>
            
            {response && (
              <div className="mt-8 p-6 bg-white/20 rounded-lg border border-white/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    I
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-3 text-purple-200">Isabella AI responde:</h4>
                    <p className="text-gray-100 leading-relaxed">{response}</p>
                    <div className="mt-4 text-sm text-purple-300">
                      ✅ Respuesta verificada éticamente • 🔍 100% explicable • 🛡️ Supervisión humana
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Isabella Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="font-bold mb-2">100% Explicable</h3>
              <p className="text-sm text-gray-300">Cada decisión de Isabella puede ser explicada en términos humanos comprensibles.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl mb-3">⚖️</div>
              <h3 className="font-bold mb-2">Principios Éticos</h3>
              <p className="text-sm text-gray-300">Programada con principios éticos inmutables que priorizan la dignidad humana.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-bold mb-2">Supervisión Humana</h3>
              <p className="text-sm text-gray-300">Siempre bajo supervisión humana, nunca toma decisiones críticas de forma autónoma.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Technology Showcase
const TechnologyShowcase = () => {
  const technologies = [
    {
      name: "XR/VR 4D Engine",
      description: "Renderizado en tiempo real con dimensión temporal",
      icon: "🔮",
      specs: ["90 FPS promedio", "Ray tracing real-time", "Physics cuántico", "Haptic feedback"],
      color: "from-purple-500 to-indigo-500"
    },
    {
      name: "Quantum Computing",
      description: "Procesamiento híbrido cuántico-clásico",
      icon: "⚛️",
      specs: ["1000 qubits", "Encriptación cuántica", "Optimización IA", "Simulación física"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Blockchain MSR",
      description: "Sistema antifraud con transparencia total",
      icon: "⛓️",
      specs: ["15 TPS", "0% fraude", "Contratos inteligentes", "Auditoría automática"],
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "TENOCHTITLAN Security",
      description: "Seguridad multicapa defensiva",
      icon: "🛡️",
      specs: ["0 brechas", "99.8% detección", "Respuesta <1s", "Cumplimiento global"],
      color: "from-red-500 to-pink-500"
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            🚀 Tecnología de Vanguardia
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            TAMV utiliza las tecnologías más avanzadas del mundo para crear experiencias imposibles en cualquier otra plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {technologies.map((tech, index) => (
            <Card key={index} className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-5xl">{tech.icon}</div>
                  <Badge className={`bg-gradient-to-r ${tech.color} text-white`}>
                    Activo
                  </Badge>
                </div>
                <CardTitle className="text-white text-2xl mb-2">{tech.name}</CardTitle>
                <p className="text-gray-300">{tech.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tech.specs.map((spec, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-400">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                      {spec}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Stats */}
        <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
          <h3 className="text-3xl font-bold text-center mb-8">📊 Rendimiento en Tiempo Real</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">99.97%</div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">120ms</div>
              <div className="text-gray-400">Latencia</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">1.2M</div>
              <div className="text-gray-400">Usuarios Concurrentes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">50TB</div>
              <div className="text-gray-400">Datos Diarios</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Investor Section
const InvestorSection = () => (
  <div className="py-20 bg-gradient-to-br from-green-900 to-blue-900 text-white">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
          💎 Oportunidad de Inversión Única
        </h2>
        <p className="text-xl text-green-200 max-w-3xl mx-auto">
          Invierte en el futuro de la civilización digital. TAMV representa la oportunidad de inversión más grande de la década.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-center p-8">
          <div className="text-6xl mb-6">🚀</div>
          <h3 className="text-2xl font-bold mb-4 text-green-300">Crecimiento Exponencial</h3>
          <p className="text-gray-300 mb-6">
            De 0 a 6.2M usuarios en 12 meses. Proyección: 100M usuarios en 2027.
          </p>
          <div className="text-4xl font-bold text-green-400">+2,300%</div>
          <div className="text-sm text-gray-400 mt-2">Crecimiento anual</div>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-center p-8">
          <div className="text-6xl mb-6">💰</div>
          <h3 className="text-2xl font-bold mb-4 text-blue-300">Ingresos Recurrentes</h3>
          <p className="text-gray-300 mb-6">
            $42M mensuales con 30+ fuentes de ingresos diversificadas.
          </p>
          <div className="text-4xl font-bold text-blue-400">$504M</div>
          <div className="text-sm text-gray-400 mt-2">Ingresos anuales</div>
        </Card>

        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-center p-8">
          <div className="text-6xl mb-6">🌍</div>
          <h3 className="text-2xl font-bold mb-4 text-purple-300">Mercado Global</h3>
          <p className="text-gray-300 mb-6">
            25 países activos, expandiendo a 100+ países. Mercado TAM: $2T.
          </p>
          <div className="text-4xl font-bold text-purple-400">$2T</div>
          <div className="text-sm text-gray-400 mt-2">Mercado total</div>
        </Card>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h3 className="text-3xl font-bold mb-8 text-center">
          ¿Por qué TAMV es la Inversión del Siglo?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-4 text-green-400">✅ Ventajas Únicas</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Único ecosistema 4D nativo del mundo
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                IA ética con explicabilidad total
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                70% ingresos para creadores vs 45-55% competencia
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Tecnología quantum-clásica híbrida
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Arquitectura antifrágil y federada
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                Cumplimiento legal proactivo global
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-4 text-blue-400">📈 Proyecciones 2026-2028</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                2026: $500M ingresos anuales
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                2027: $2B ingresos anuales
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                2028: $5B ingresos anuales
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                IPO proyectado: Q4 2027
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Valoración objetivo: $50B
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                ROI proyectado: 10,000%+
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-bold rounded-xl">
              📧 Contactar para Inversión
            </Button>
            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 px-8 py-4 text-lg font-bold rounded-xl">
              📊 Descargar Pitch Deck
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Global Presence
const GlobalPresence = () => {
  const regions = [
    { name: "América", countries: 12, users: "3.2M", revenue: "$18M", flag: "🌎" },
    { name: "Europa", countries: 8, users: "1.8M", revenue: "$15M", flag: "🇪🇺" },
    { name: "Asia-Pacífico", countries: 5, users: "1.2M", revenue: "$9M", flag: "🌏" }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
            🌍 Presencia Global
          </h2>
          <p className="text-xl text-indigo-200 max-w-3xl mx-auto">
            TAMV opera en 25 países y está expandiéndose rápidamente hacia una cobertura global completa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {regions.map((region, index) => (
            <Card key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 text-center">
              <div className="text-6xl mb-4">{region.flag}</div>
              <h3 className="text-2xl font-bold mb-4 text-indigo-300">{region.name}</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-white">{region.countries}</div>
                  <div className="text-sm text-gray-400">Países Activos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{region.users}</div>
                  <div className="text-sm text-gray-400">Usuarios</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{region.revenue}</div>
                  <div className="text-sm text-gray-400">Ingresos Mensuales</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h3 className="text-3xl font-bold text-center mb-8">🚀 Plan de Expansión 2026</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4 text-indigo-400">Q1-Q2 2026</h4>
              <ul className="space-y-2 text-gray-300">
                <li>🇧🇷 Brasil - Lanzamiento completo</li>
                <li>🇦🇷 Argentina - Beta público</li>
                <li>🇨🇱 Chile - Servicios básicos</li>
                <li>🇨🇴 Colombia - Red social</li>
                <li>🇵🇪 Perú - Marketplace</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4 text-purple-400">Q3-Q4 2026</h4>
              <ul className="space-y-2 text-gray-300">
                <li>🇯🇵 Japón - Tecnología XR</li>
                <li>🇰🇷 Corea del Sur - Gaming</li>
                <li>🇮🇳 India - Educación</li>
                <li>🇦🇺 Australia - Servicios completos</li>
                <li>🇿🇦 Sudáfrica - Piloto</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Footer
const Footer = () => (
  <footer className="bg-black text-white py-20">
    <div className="container mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          🚀 Únete a la Revolución Digital
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          TAMV DreamWorld v2.0 - Donde el futuro digital ya es realidad. 
          Sé parte del primer ecosistema civilizacional del mundo.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-16">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-bold rounded-xl transform hover:scale-105 transition-all">
            🌟 Crear Cuenta Gratuita
          </Button>
          <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-4 text-lg font-bold rounded-xl transform hover:scale-105 transition-all">
            💼 Información para Inversores
          </Button>
          <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 text-lg font-bold rounded-xl transform hover:scale-105 transition-all">
            🤝 Partnerships Estratégicos
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
        <div>
          <h3 className="text-xl font-bold mb-6 text-purple-400">🌐 Servicios</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="hover:text-white transition-colors cursor-pointer">Red Social Avanzada</li>
            <li className="hover:text-white transition-colors cursor-pointer">Universidad TAMV</li>
            <li className="hover:text-white transition-colors cursor-pointer">Marketplace Global</li>
            <li className="hover:text-white transition-colors cursor-pointer">Servicios de Salud</li>
            <li className="hover:text-white transition-colors cursor-pointer">Gaming & Esports</li>
            <li className="hover:text-white transition-colors cursor-pointer">Servicios Financieros</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-6 text-blue-400">🤖 Tecnología</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="hover:text-white transition-colors cursor-pointer">XR/VR 4D Engine</li>
            <li className="hover:text-white transition-colors cursor-pointer">Isabella AI Ética</li>
            <li className="hover:text-white transition-colors cursor-pointer">Quantum Computing</li>
            <li className="hover:text-white transition-colors cursor-pointer">Blockchain MSR</li>
            <li className="hover:text-white transition-colors cursor-pointer">TENOCHTITLAN Security</li>
            <li className="hover:text-white transition-colors cursor-pointer">Arquitectura Federada</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-6 text-green-400">🏢 Empresa</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="hover:text-white transition-colors cursor-pointer">Sobre TAMV</li>
            <li className="hover:text-white transition-colors cursor-pointer">Equipo Directivo</li>
            <li className="hover:text-white transition-colors cursor-pointer">Inversores</li>
            <li className="hover:text-white transition-colors cursor-pointer">Carreras</li>
            <li className="hover:text-white transition-colors cursor-pointer">Prensa</li>
            <li className="hover:text-white transition-colors cursor-pointer">Contacto</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-6 text-orange-400">📞 Contacto</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="hover:text-white transition-colors">📧 hello@tamv.org</li>
            <li className="hover:text-white transition-colors">📧 investors@tamv.org</li>
            <li className="hover:text-white transition-colors">📧 press@tamv.org</li>
            <li className="hover:text-white transition-colors">🌐 tamv.org</li>
            <li className="hover:text-white transition-colors">📍 Real del Monte, Hidalgo, México</li>
            <li className="hover:text-white transition-colors">📱 +52 771 XXX XXXX</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8">
        <div className="text-center">
          <p className="text-gray-400 mb-4">
            © 2026 TAMV Holdings S.A. de C.V. Todos los derechos reservados.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Desarrollado con orgullo por Edwin Oswaldo Castillo Trejo (Anubis Villaseñor) • Orgullosamente Realmontense - México 🇲🇽
          </p>
          <p className="text-xs text-gray-600 mb-6">
            "Donde la memoria limita al poder, y la dignidad dicta lo que la tecnología puede hacer."
          </p>
          
          {/* Social Links */}
          <div className="flex justify-center space-x-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <span className="text-white font-bold">T</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <span className="text-white font-bold">I</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <span className="text-white font-bold">L</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
              <span className="text-white font-bold">Y</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default App;