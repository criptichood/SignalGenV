import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrackedWallet, StablecoinHolding } from '@/types';

const STABLECOINS_SUPPORTED: { symbol: 'USDC' | 'USDT' | 'DAI', name: string }[] = [
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'DAI', name: 'Dai' },
];

// Mock service to simulate fetching wallet balances from a blockchain API
async function fetchStablecoinBalances(address: string): Promise<StablecoinHolding[]> {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Generate random balances for the mock, using the address as a seed for consistency
    const seededRandom = (seed: string) => {
        let h = 1779033703 ^ seed.length;
        for (let i = 0; i < seed.length; i++) {
            h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
            h = h << 13 | h >>> 19;
        }
        return () => {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return ((h ^= h >>> 16) >>> 0) / 4294967296;
        }
    };

    const random = seededRandom(address);

    const holdings: StablecoinHolding[] = STABLECOINS_SUPPORTED.map(coin => {
        const balance = random() * 15000;
        return {
            symbol: coin.symbol,
            name: coin.name,
            balance,
            value: balance, // Assume 1:1 with USD
        };
    }).filter(h => h.balance > 100);

    return holdings;
}


interface StablecoinState {
  wallets: TrackedWallet[];
  holdings: Record<string, { data: StablecoinHolding[], isLoading: boolean }>;
  
  addWallet: (address: string, label: string) => void;
  deleteWallet: (walletId: string) => void;
  fetchBalancesForWallet: (wallet: TrackedWallet) => Promise<void>;
  fetchBalancesForAllWallets: () => void;
}

export const useStablecoinStore = create<StablecoinState>()(
  persist(
    (set, get) => ({
      wallets: [],
      holdings: {},
      
      fetchBalancesForWallet: async (wallet) => {
        set(state => ({
            holdings: { ...state.holdings, [wallet.id]: { data: [], isLoading: true } }
        }));
        try {
            const data = await fetchStablecoinBalances(wallet.address);
            set(state => ({
                holdings: { ...state.holdings, [wallet.id]: { data, isLoading: false } }
            }));
        } catch (error) {
            console.error(`Failed to fetch balances for wallet ${wallet.id}`, error);
            set(state => ({
                holdings: { ...state.holdings, [wallet.id]: { data: [], isLoading: false } } // Clear loading on error
            }));
        }
      },

      fetchBalancesForAllWallets: () => {
        const { wallets, holdings, fetchBalancesForWallet } = get();
        wallets.forEach(wallet => {
            if (!holdings[wallet.id]) {
                fetchBalancesForWallet(wallet);
            }
        });
      },
      
      addWallet: (address: string, label: string) => {
        const { fetchBalancesForWallet } = get();
        const newWallet: TrackedWallet = {
            id: crypto.randomUUID(),
            address,
            label,
            network: 'Ethereum',
        };
        set(state => ({ wallets: [...state.wallets, newWallet] }));
        fetchBalancesForWallet(newWallet);
      },

      deleteWallet: (walletId: string) => {
        set(state => {
            const newWallets = state.wallets.filter(w => w.id !== walletId);
            const newHoldings = { ...state.holdings };
            delete newHoldings[walletId];
            return {
                wallets: newWallets,
                holdings: newHoldings
            };
        });
      },
    }),
    {
      name: 'stablecoin-stash-storage',
      partialize: (state) => ({
        wallets: state.wallets,
      }),
    }
  )
);