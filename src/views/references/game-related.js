
import { ref } from "vue"

export const pdfList = ref([
    // --- Algorithmic Game Theory / Equilibria ---
    { id: '1202.0405', title: 'An Algorithmic Game Theory Primer' },
    { id: '1409.3046', title: 'Computing Nash Equilibria in Bimatrix Games' },
    { id: '1506.03905', title: 'Multiplicative-Weights Update in Zero-Sum Games' },

    // --- Poker & Bluffing ---
    { id: '1701.01724', title: 'DeepStack: Expert-Level AI in No-Limit Poker' },
    { id: '1902.04551', title: 'Superhuman AI for Multi-Player Poker (Pluribus)' },

    // --- Board & Classic Games ---
    { id: '1712.01815', title: 'Mastering Chess and Shogi by Self-Play (AlphaZero)' },
    { id: '1902.04501', title: 'AlphaZero: Shedding New Light on Chess, Go and Shogi' },
    { id: '1602.01767', title: 'Mastering the Game of Go with Deep Neural Networks (AlphaGo)' },

    // --- Real-Time Strategy / MOBA ---
    { id: '1912.06680', title: 'Grandmaster Level in StarCraft II Using Multi-Agent RL (AlphaStar)' },
    { id: '2103.15355', title: 'OpenDota5: Large-Scale Pre-Training for MOBA Games' },

    // --- General Game Playing / RL ---
    { id: '1912.10929', title: 'MuZero: Planning with a Learned Model' },
    { id: '2107.06234', title: 'XLand: Open-Ended Learning Leads to Generally Capable Agents' },
    { id: '2103.01955', title: 'Emergent Tool Use from Multi-Agent Autocurricula' },

    // --- Mechanism Design / Auctions ---
    { id: '1404.6914', title: 'Auctions, Mechanisms, and Deep Learning' },
    { id: '1707.07343', title: 'Optimal Auctions through Deep Learning' },

    // --- Social Dilemmas & Cooperation ---
    { id: '1707.01068', title: 'Multi-Agent Reinforcement Learning in Sequential Social Dilemmas' },
    { id: '1901.08106', title: 'The Hanabi Challenge: A New Frontier for AI Cooperation' },

    // --- Game Benchmarks & Datasets ---
    { id: '1906.01392', title: 'OpenSpiel: A Framework for Reinforcement Learning in Games' },
    { id: '2011.05927', title: 'PettingZoo: Gym for Multi-Agent Reinforcement Learning' }
])
