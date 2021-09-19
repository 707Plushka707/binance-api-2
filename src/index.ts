import {
  Application,
  Response,
  Request,
} from 'express';
import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import {updateBalance, getBalance, updatePrice, getPrice, getUSDTHoldings} from './cache/index';

const dotenv = require('dotenv');
dotenv.config();
const alerts = require('trading-indicator').alerts
const Binance = require('node-binance-api');

const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET,
  useServerTime: true,
  recvWindow: 60000, // Set a higher recvWindow to increase response timeout
  verbose: true,
  test: true,
});
const app: Application = express();

const tokenList = ['BTC', 'EOS', 'ETH']

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const updateInterval = 7000;

const handelBalance = async () => {
  const checkBalance = async () => {
    try {
      binance.balance((error, balances) => {
        if (error) return console.error(error);
        updateBalance(balances);
      })

    } catch (error) {
      console.error(error.message);
    }
  }
  checkBalance();
  setInterval(checkBalance, updateInterval)
}

const  handlePrices = async () => {
  const checkPrices = async () => {
    try {
      let ticker = await binance.prices();
      updatePrice(ticker);
    } catch (error: any) {
      console.error(error.message);
    }
  }
  checkPrices();
  setInterval(checkPrices, updateInterval)
}
const checkEMA = async () => {
  const checkPrices = async () => {
    try {
      tokenList.map( async(token) => {
        const cross = await alerts.maCross(50, 200, 'binance', `${token}/USDT`, '1m', false);
        if(cross.goldenCross || cross.deathCross) {
          console.log(cross)
          binance.prices( `${token}USDT`, (error, ticker) => {
            console.info("Price of EOS: ", ticker[`${token}USDT`]);
          });
        }
      })

    } catch (error) {
      console.error(error.message);
    }
  }
  checkPrices();
  setInterval(checkPrices, updateInterval)
}

(async ()=> {
  await handelBalance();
  await handlePrices();
  await checkEMA();
})();


app.get('/get-holdings-USDT', (_req: Request,res:Response) => {
  const tempHoldingsUsdt = getUSDTHoldings();
  res.status(200).json({
    'status': 'OK',
    'message': 'ok',
    'data': tempHoldingsUsdt,
  });
});


app.get('/get-balance', (_req: Request,res:Response) => {
  const currentBalance = getBalance();
  res.status(200).json({
    'status': 'OK',
    'message': 'ok',
    'data': currentBalance,
  });
});

app.get('/get-prices', (_req: Request,res:Response) => {
  const prices = getPrice();
  res.status(200).json({
    'status': 'OK',
    'message': 'ok',
    'data': prices,
  });
});

app.get('/get-trade-history', (req: Request, res: Response) => {
  try {
    const { query } = req;
    const { symbol, base } = query;
    if (symbol) {
      binance.trades(`${symbol}${base ? base : 'USDT'}`, (error: any, trades: any, _symbol: any) => {
        if (error) return console.error(error.body);
        res.status(200).json({
          'status': 'OK',
          'message': 'ok',
          'data': trades,
        });
      });
    } else {
      return console.error('No symbol avalible');
    }
  } catch (error: any) {
    console.error(error.message);
  }
});

const port = process.env.PORT ?? 8080;

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});