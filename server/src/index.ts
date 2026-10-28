import { config } from './config';
import { createApp } from './app';

createApp().listen(config.port, () => console.log(`API S&L Construcciones en http://localhost:${config.port}`));
