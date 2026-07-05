import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.APP_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
  },
})
export class RealtimeGateway {
  @WebSocketServer() server!: Server;
  broadcast(event: string, payload: unknown) {
    this.server.emit(event, payload);
  }
}
