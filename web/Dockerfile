FROM nginx:alpine

# Custom entrypoint handles $PORT substitution at runtime
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
 && rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /tmp/nginx.conf.template
COPY index.html /usr/share/nginx/html/index.html

ENTRYPOINT ["/entrypoint.sh"]
