import { BalanceCache, PriceUSDT } from '../global';

type Price = {
  [key:string]: string
}
let balanceCache: BalanceCache;
let pricesCache: Price;
let holdingPricesUSDT: PriceUSDT[];

const handleBalances = (balances: BalanceCache): BalanceCache => {
  let positiveBalance = {} as BalanceCache;
  Object.keys(balances).forEach((keys: string) => {
    if (parseFloat(balances[keys].available) > 0.001 || parseFloat(balances[keys].onOrder) > 0.001) {
      positiveBalance[keys] = balances[keys]
    }
  });
  return positiveBalance; 
};

export const updateUSDTHoldings = () => {
  const tempHolding = [];
  Object.keys(balanceCache).map((key) => {
    Object.keys(pricesCache).map((keyP) => {
      if(keyP === `${key}USDT`) {
        tempHolding.push({
          symbol: key,
          price: pricesCache[keyP],
          balance: parseFloat(balanceCache[key].available).toFixed(2),
          assetValue: (parseFloat(pricesCache[keyP]) * parseFloat(balanceCache[key].available)).toFixed(2)
        })
      }
    });
  });
  holdingPricesUSDT = [...tempHolding];
  console.log("Price Updated.")
  return holdingPricesUSDT;
}

export const getUSDTHoldings = () => holdingPricesUSDT;

export const updatePrice = (data: Price): Price => {
  pricesCache = data;
  updateUSDTHoldings();
  return pricesCache;
}

export const getPrice = (): Price => {
  return pricesCache;
}


export const updateBalance = (data: BalanceCache): BalanceCache => {
  balanceCache = handleBalances(data);
  return balanceCache;
}

export const getBalance = (): BalanceCache => {
  return balanceCache;
}

export default {
  updateBalance,
  handleBalances,
  getPrice,
  updatePrice,
  getBalance,
  getUSDTHoldings,
  updateUSDTHoldings,
};