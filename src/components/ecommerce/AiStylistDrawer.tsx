import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User, ArrowRight, Compass } from 'lucide-react';
import { Product } from '../../types/ecommerce';
import { PRODUCTS } from '../../data/products';

interface AiStylistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  recommendedProductIds?: string[];
}

export const AiStylistDrawer: React.FC<AiStylistDrawerProps> = ({
  isOpen,
  onClose,
  onSelectProduct
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Velkommen to the Atelier Nordic Interior Concierge. I specialize in spatial balance, raw material dialogues, and curating architectural living environments. How may I assist your space today?',
      recommendedProductIds: ['nordic-lounge-chair', 'aethel-brass-pendant']
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'How do I style the Kallio Oak Chair?',
    'What lighting pairs well with travertine?',
    'Recommend a statement coffee table',
    'Tips for Nordic minimalist balance'
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Contextual intelligent responses crafted for high-end interior architecture
    setTimeout(() => {
      let reply = '';
      let recommended: string[] = [];

      const lower = query.toLowerCase();
      if (lower.includes('chair') || lower.includes('kallio')) {
        reply =
          'The Kallio Lounge Chair possesses strong architectural presence. To balance its European white oak mass, position the Aethel Spun Brass Dome Pendant above it at a 45-degree angle. Ground the vignette with the Vrå Cast Iron Censer on a side plinth for subtle organic contrast.';
        recommended = ['nordic-lounge-chair', 'aethel-brass-pendant', 'cast-iron-incense-burner'];
      } else if (lower.includes('light') || lower.includes('travertine') || lower.includes('lamp')) {
        reply =
          'For natural stone like travertine, warm diffuse illumination between 2400K and 2700K reveals the pitted mineral cavities without harsh specular reflection. The Altum Travertine Table Lamp and the Aethel Spun Brass Pendant both offer continuous dimming to set calm twilight moods.';
        recommended = ['travertine-pillar-lamp', 'aethel-brass-pendant'];
      } else if (lower.includes('table') || lower.includes('coffee') || lower.includes('marble')) {
        reply =
          'The Nero Marquina Monolith Coffee Table brings low-profile gravity to open living areas. Its deep black basque stone with white calcite veins creates an anchor point. We recommend styling it with the Silo Fluted Ceramic Vessel and leaving generous negative space around it.';
        recommended = ['nero-monolith-table', 'silo-fluted-vessel'];
      } else {
        reply =
          'In Nordic architectural spaces, the secret lies in restricting the palette to 2 or 3 tactile materials—such as solid oiled oak, honed dark stone, and untreated brass—while allowing abundant natural light to activate their micro-textures throughout the day.';
        recommended = ['nordic-lounge-chair', 'silo-fluted-vessel', 'aethel-brass-pendant'];
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: reply,
          recommendedProductIds: recommended
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-2xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E7E2DA] shadow-2xl flex flex-col justify-between animate-fade-in">
          {/* Header */}
          <div className="p-5 border-b border-[#E7E2DA] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1C1917] text-amber-300 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-luxury text-base font-semibold text-[#1C1917] tracking-wider uppercase">
                  Atelier Interior Stylist
                </h3>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest">
                  Spatial Consultation · Gemini Powered
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 bg-[#F5F2EC] border-b border-[#E7E2DA] overflow-x-auto flex gap-1.5 scrollbar-none">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-full bg-white border border-[#E7E2DA] text-[10px] font-medium text-stone-700 hover:border-stone-400 whitespace-nowrap transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-lg text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#1C1917] text-white rounded-br-none'
                      : 'bg-white border border-[#E7E2DA] text-stone-800 rounded-bl-none shadow-2xs'
                  }`}
                >
                  <p>{m.text}</p>
                </div>

                {/* Recommended product cards */}
                {m.recommendedProductIds && m.recommendedProductIds.length > 0 && (
                  <div className="mt-2.5 space-y-1.5 w-full max-w-[88%]">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-stone-400">
                      Curated Works:
                    </span>
                    {m.recommendedProductIds.map((id) => {
                      const prod = PRODUCTS.find((p) => p.id === id);
                      if (!prod) return null;
                      return (
                        <div
                          key={id}
                          onClick={() => {
                            onSelectProduct(prod);
                            onClose();
                          }}
                          className="flex items-center justify-between p-2 rounded bg-white hover:bg-stone-50 border border-[#E7E2DA] cursor-pointer transition-all shadow-2xs group"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-10 h-10 object-cover rounded bg-[#F5F2EC]"
                            />
                            <div>
                              <p className="font-serif-luxury text-xs font-semibold text-stone-900 group-hover:text-amber-800 transition-colors">
                                {prod.name}
                              </p>
                              <p className="text-[10px] text-stone-500 tabular-nums">
                                ${prod.price.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-colors" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-stone-400 text-xs pl-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span>Atelier Stylist is considering compositions...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-[#E7E2DA]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about materials, lighting, styling..."
                className="flex-1 px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7E2DA] rounded text-xs text-stone-900 focus:outline-none focus:border-[#1C1917]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 rounded bg-[#1C1917] text-white hover:bg-stone-800 disabled:opacity-40 transition-colors"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
