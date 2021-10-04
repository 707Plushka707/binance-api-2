export type Balance = {
  available: string,
  onOrder:string
}

export type BalanceCache = {
  [key: string] : Balance
}

export type PriceUSDT = {
  symbol: string,
  price: string,
  balance: number,
  assetValue: number,
}