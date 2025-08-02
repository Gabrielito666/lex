# build-jsx

Compilamos el código lex.jsx a javascript.

buildJSX.standart(mainJsx);
buildJSX.layout(layoutJsx, pageJsx);

# build-html

incrustamos en un JSDOM el código obtenido desde build-jsx y ejecutamos el script en un sandbox sin bloquear ni esperar resolcuciones asincronas.

Serializamos el html y lo retornamos

buildHTML.standart(mainJsx);
buildHTML.layout(layoutJsx, pageJsx);

En el caso de esta ejecución productora de html se debe reemplazar los import @lek-js/lex por @lek-js/lex/builder-lex-lib para evitar la ejecución de los useClient.