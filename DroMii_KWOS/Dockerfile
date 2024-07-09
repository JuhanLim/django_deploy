# 1. Node.js 이미지를 사용하여 빌드 단계 설정
FROM node:18.17.0-alpine AS build

# 2. 작업 디렉토리 설정
WORKDIR /app

# 3. 패키지 파일 복사 및 종속성 설치
COPY package.json ./
COPY package-lock.json ./
# 그냥 npm install 했더니 오류나서 -g 해야하나봄 
RUN npm install -g npm@10.8.1 
RUN npm install
#RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object --legacy-peer-deps


# 4. 모든 소스 파일 복사
COPY . ./

# 5. 빌드 실행
RUN npm run build

# # 6. Nginx를 사용하여 정적 파일 서빙
# FROM nginx:alpine

# # 7. Nginx 설정 파일 복사
# COPY nginx.conf /etc/nginx/nginx.conf
# 8. 빌드된 파일들을 Nginx의 정적 파일 서빙 디렉토리로 복사
# WORKDIR /app
# COPY --from=build /app/build /usr/share/nginx/html
#-> COPY 명령어는 컨테이너 안에 복사하는 것이라서 컨테이너-> 로컬로 복사할 수는 없다. 
#docker cp reactserver:/app/build /usr/share/nginx/html 을 수동으로 실행하거나 스크립트로 만들어 묶어야함. 
# 또는 run 시 volume 기능을 사용해서 로컬에 동기화 가능!! < 이방법이 좋아보임 
# -> -v /usr/share/nginx/html:/app/build 
# -> 하지만 이 경우 호스트파일이 우선이기때문에 컨테이너파일도 다 초기화된다. 
#-> cp 사용해야할듯 

# # 9. 3000 포트 노출 
EXPOSE 3000

CMD ["npm","start"]



# # 10. Nginx 실행 
# CMD ["nginx", "-g", "daemon off;"]
