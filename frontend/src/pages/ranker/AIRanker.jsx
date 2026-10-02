// pages/ranker/AIRanker.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const AIRanker = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'seo', label: 'SEO' },
    { id: 'ranking', label: 'Ranking' },
    { id: 'optimization', label: 'Optimization' },
    { id: 'research', label: 'Research' },
    { id: 'technical', label: 'Technical' },
  ];

  // Fetch ranker agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ai-ranker/agents');

      if (response.data?.success) {
        setAgents(response.data.agents);
      } else {
        toast.error('Failed to load ranker agents');
      }
    } catch (error) {
      console.error('❌ Error fetching ranker agents:', error);
      toast.error('Failed to load AI ranker agents');
    } finally {
      setLoading(false);
    }
  };

  // Create new chat and navigate
  const handleAgentClick = async (agent) => {
    if (!agent || !agent.slug) {
      toast.error('Invalid agent selected');
      return;
    }

    try {
      const response = await api.post('/ai-ranker/chat/new', {
        agentSlug: agent.slug,
      });

      if (response.data?.success && response.data?.chat?.id) {
        const chatId = response.data.chat.id;
        navigate(`/ai-ranker/chat/${chatId}`);
      } else {
        toast.error('Failed to create chat');
      }
    } catch (error) {
      console.error('❌ Error creating ranker chat:', error);
      toast.error(error.response?.data?.message || 'Failed to start chat');
    }
  };

  // Filter agents
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || agent.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex h-screen" style={{ background: '#020914' }}>
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: '4px solid rgba(110,53,237,.15)' }}
              ></div>
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  border: '4px solid #6e35ed',
                  borderTopColor: 'transparent',
                }}
              ></div>
            </div>
            <p className="text-sm" style={{ color: '#8fa0ba' }}>
              Loading AI ranker agents...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#020914' }}>
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #6e35ed, #3483ff)',
                  boxShadow: '0 8px 20px rgba(110,53,237,.35)',
                }}
              >
                <i className="fas fa-chart-line text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#eaf1ff' }}>
                  AI Ranker
                </h1>
                <p className="text-sm" style={{ color: '#8fa0ba' }}>
                  Choose a ranker agent to improve your website SEO and ranking
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search ranker agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition"
                style={{
                  background: '#06162b',
                  border: '1px solid #17385f',
                  color: '#eaf1ff',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(150,120,255,.6)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110,53,237,.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#17385f';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <i
                className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-sm"
                style={{ color: '#7d8fa8' }}
              ></i>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 flex-nowrap sm:flex-wrap">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                    style={
                      isActive
                        ? {
                            background: 'linear-gradient(100deg, #6e35ed, #3483ff)',
                            color: '#fff',
                            boxShadow: '0 4px 14px rgba(110,53,237,.35)',
                            border: '1px solid rgba(150,120,255,.5)',
                          }
                        : {
                            background: 'rgba(6,20,42,.6)',
                            border: '1px solid #17385f',
                            color: '#aebfd5',
                          }
                    }
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agent Grid */}
          {filteredAgents.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl"
              style={{
                background: '#06162b',
                border: '1px solid #17385f',
              }}
            >
              <i className="fas fa-search text-4xl mb-4" style={{ color: '#7d8fa8' }}></i>
              <p className="text-sm" style={{ color: '#8fa0ba' }}>
                No ranker agents found
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="text-sm hover:underline mt-2 transition"
                style={{ color: '#c9b5ff' }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAgents.map((agent) => (
                <RankerCard
                  key={agent.id}
                  agent={agent}
                  onClick={handleAgentClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Ranker Card Component
// ============================================================

const RankerCard = ({ agent, onClick }) => {
  const getCategoryLabel = (category) => {
    const labels = {
      seo: 'SEO',
      ranking: 'Ranking',
      optimization: 'Optimization',
      research: 'Research',
      technical: 'Technical',
    };
    return labels[category] || category;
  };

  // Dark-tinted category colors
  const getCategoryStyle = (category) => {
    const colors = {
      seo: {
        background: 'rgba(12,228,189,.15)',
        border: '1px solid rgba(12,228,189,.35)',
        color: '#0ce4bd',
      },
      ranking: {
        background: 'rgba(80,150,255,.15)',
        border: '1px solid rgba(80,150,255,.35)',
        color: '#6ddcff',
      },
      optimization: {
        background: 'rgba(255,207,112,.15)',
        border: '1px solid rgba(255,207,112,.35)',
        color: '#ffcf70',
      },
      research: {
        background: 'rgba(150,120,255,.15)',
        border: '1px solid rgba(150,120,255,.4)',
        color: '#c9b5ff',
      },
      technical: {
        background: 'rgba(37,209,218,.15)',
        border: '1px solid rgba(37,209,218,.35)',
        color: '#25d1da',
      },
    };
    return (
      colors[category] || {
        background: 'rgba(80,150,255,.12)',
        border: '1px solid rgba(80,150,255,.3)',
        color: '#aebfd5',
      }
    );
  };

  return (
    <div
      onClick={() => onClick(agent)}
      className="group rounded-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
      style={{
        background: '#06162b',
        border: '1px solid #17385f',
        boxShadow: '0 4px 20px rgba(0,0,0,.35)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(150,120,255,.5)';
        e.currentTarget.style.boxShadow =
          '0 22px 50px rgba(0,0,0,.6), 0 0 0 1px rgba(140,120,255,.25) inset';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#17385f';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.35)';
      }}
    >
      <div className="p-5">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
          style={{ backgroundColor: agent.color + '25' }}
        >
          <i
            className={`fas ${agent.icon} text-xl`}
            style={{ color: agent.color }}
          ></i>
        </div>

        {/* Content */}
        <h3
          className="text-base font-semibold transition-colors group-hover:text-[#c9b5ff]"
          style={{ color: '#eaf1ff' }}
        >
          {agent.name}
        </h3>
        <p className="text-xs mt-0.5" style={{ color: '#8fa0ba' }}>
          {agent.role}
        </p>

        <p
          className="text-sm line-clamp-2 mt-3 min-h-[40px]"
          style={{ color: '#aebfd5' }}
        >
          {agent.description}
        </p>

        {/* Footer */}
        <div
          className="flex items-center justify-between pt-3 mt-3"
          style={{ borderTop: '1px solid rgba(80,150,255,.1)' }}
        >
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={getCategoryStyle(agent.category)}
          >
            {getCategoryLabel(agent.category)}
          </span>

          <button
            className="text-xs font-medium transition flex items-center gap-1 group-hover:text-[#eaf1ff]"
            style={{ color: '#c9b5ff' }}
            onClick={(e) => {
              e.stopPropagation();
              onClick(agent);
            }}
          >
            Chat Now
            <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-0.5 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIRanker;
