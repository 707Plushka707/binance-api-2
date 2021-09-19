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
    if (parseInt(balances[keys].available) > 0.01 || parseInt(balances[keys].onOrder) > 0.01) {
      positiveBalance[keys] = balances[keys]
    }
  });
  return positiveBalance; 
};

const updateUSDTHoldings = () => {
  const tempHolding = [];
  Object.keys(balanceCache).map((key) => {
    Object.keys(pricesCache).map((keyP) => {
      if(keyP === `${key}USDT`) {
        tempHolding.push({
          symbol: key,
          price: pricesCache[keyP],
          holdingValue: (parseInt(pricesCache[keyP]) * parseInt(balanceCache[key].available)).toFixed(2)
        })
      }
    });
  });
  holdingPricesUSDT = [...tempHolding];
  console.log("Price Updated.")
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
};