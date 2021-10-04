import {Server, Socket} from 'socket.io';
import { getBalance, getPrice, getUSDTHoldings} from '../Cache';
import { UPDATEBALANCE,UPDATEHOLDING, UPDATEPRICE } from './types';

let currentIo: Server;
export const Controller = (io: Server): void => {
  currentIo = io;
  io.on('connection', async(socket: Socket) => {
    socket.emit(UPDATEBALANCE, getBalance());
    socket.emit(UPDATEHOLDING, getUSDTHoldings());
    socket.emit(UPDATEPRICE, getPrice());
  })
}

export const updateAssets = (io: Server, balance: any): void => {
  if(io) {
    currentIo.emit(UPDATEHOLDING, balance);
  }
}
export default Controller;