FROM electronuserland/builder:wine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run electron:build --windows  # This is the crucial command!