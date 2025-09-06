FROM --platform=linux/amd64 codercom/code-server:4.96.4

WORKDIR /home/coder/project

EXPOSE 8080

CMD ["code-server", "--bind-addr", "0.0.0.0:8080"]

# docker run -d \
#   -p 8080:8080 \
#   -v /Users/pritam/Documents/Projects/AptosCrafter/apps/Volume:/home/coder/project \
#   -e PASSWORD="mypassword123" \
#   --name aptos-codercom \
#   codercom/code-server:4.96.4


