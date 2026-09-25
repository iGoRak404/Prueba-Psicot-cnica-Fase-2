import { SenaQuestion, GroupLetter, Difficulty } from '../types';

export const DEFAULT_SENA_QUESTIONS: Record<GroupLetter, Record<Difficulty, SenaQuestion[]>> = {
  A: {
    easy: [
      {
        id: 'A-e-1',
        text: '¿Qué método HTTP se utiliza según la arquitectura REST para solicitar la lectura o consulta de un recurso sin modificar el estado del servidor?',
        type: 'multiple',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correct: 0,
        score: 1,
        category: 'Arquitectura Web',
        difficulty: 'easy',
        feedback: 'El método GET es idempotente y seguro, diseñado exclusivamente para recuperar representaciones de recursos.'
      },
      {
        id: 'A-e-2',
        text: '¿Cuál es la principal ventaja de utilizar TypeScript sobre JavaScript puro en proyectos de software empresariales?',
        type: 'multiple',
        options: [
          'Tipado estático en tiempo de compilación y detección temprana de errores',
          'Hace que el código se ejecute el doble de rápido en el navegador',
          'Reemplaza por completo la necesidad de usar HTML y CSS',
          'Permite prescindir del servidor web para bases de datos'
        ],
        correct: 0,
        score: 1,
        category: 'Desarrollo Frontend',
        difficulty: 'easy',
        feedback: 'TypeScript agrega un sistema de tipos estático que detecta errores antes de la ejecución y mejora el autocompletado y refactorización.'
      },
      {
        id: 'A-e-3',
        text: '¿Qué representa el DOM (Document Object Model) en una aplicación web?',
        type: 'multiple',
        options: [
          'Una representación en árbol de los elementos del documento HTML que los scripts pueden manipular',
          'El protocolo de comunicación entre el frontend y el backend',
          'Un motor de base de datos relacional ligero',
          'El compilador de hojas de estilo en cascada'
        ],
        correct: 0,
        score: 1,
        category: 'Frontend',
        difficulty: 'easy',
        feedback: 'El DOM es la interfaz de programación para documentos web que representa la página como un árbol de nodos.'
      },
      {
        id: 'A-e-4',
        text: 'En Git, ¿cuál comando muestra el estado del árbol de trabajo, archivos modificados y en staging?',
        type: 'multiple',
        options: ['git status', 'git check', 'git log --oneline', 'git inspect'],
        correct: 0,
        score: 1,
        category: 'Control de Versiones',
        difficulty: 'easy',
        feedback: 'git status muestra las ramas actuales, archivos en stage, archivos modificados y no rastreados.'
      },
      {
        id: 'A-e-5',
        text: 'Verdadero o Falso: En JavaScript moderno, una variable declarada con `const` no puede ser reasignada, aunque sus propiedades internas sí pueden mutar si es un objeto.',
        type: 'truefalse',
        correct: true,
        score: 1,
        category: 'JavaScript',
        difficulty: 'easy',
        feedback: 'Correcto. `const` protege la referencia de la variable contra reasignaciones, pero no congela las propiedades del objeto referenciado.'
      },
      {
        id: 'A-e-6',
        text: '¿Cuál es el código de estado HTTP estándar retornado cuando un recurso solicitado no fue encontrado en el servidor?',
        type: 'numeric',
        correct: 404,
        tolerance: 0,
        score: 1,
        category: 'Protocolos Web',
        difficulty: 'easy',
        feedback: 'El código 404 Not Found indica que el servidor no puede encontrar el recurso solicitado.'
      },
      {
        id: 'A-e-7',
        text: 'Explica con tus palabras qué es una función pura en programación y menciona dos de sus características fundamentales.',
        type: 'open',
        score: 2,
        category: 'Paradigmas de Programación',
        difficulty: 'easy',
        feedback: 'Una función pura siempre devuelve el mismo resultado ante los mismos argumentos y no produce efectos secundarios (side effects).'
      },
      {
        id: 'A-e-8',
        text: '¿Qué formato de intercambio de datos estructurado basado en texto plano es el más utilizado en APIs modernas por ser ligero y fácil de parsear?',
        type: 'multiple',
        options: [
          'JSON (JavaScript Object Notation)',
          'XML (Extensible Markup Language)',
          'YAML (YAML Ain\'t Markup Language)',
          'CSV (Comma-Separated Values)'
        ],
        correct: 0,
        score: 1,
        category: 'Formatos de Datos',
        difficulty: 'easy',
        feedback: 'JSON es el estándar de facto en servicios web RESTful por su simplicidad, soporte nativo y menor sobrecarga respecto a XML.'
      }
    ],
    medium: [
      {
        id: 'A-m-1',
        text: '¿Cuáles de los siguientes son principios fundamentales de la Programación Orientada a Objetos (POO)? (Selecciona todos los que correspondan)',
        type: 'checkbox',
        options: ['Encapsulamiento', 'Herencia', 'Polimorfismo', 'Abstracción', 'Transpilación asíncrona'],
        corrects: [0, 1, 2, 3],
        score: 2,
        category: 'POO',
        difficulty: 'medium',
        feedback: 'Los 4 pilares fundamentales de la POO son: Encapsulamiento, Herencia, Polimorfismo y Abstracción.'
      },
      {
        id: 'A-m-2',
        text: '¿Cuál es la principal ventaja de utilizar async/await sobre las cadenas de promesas (`.then()`) tradicionales en JavaScript/TypeScript?',
        type: 'multiple',
        options: [
          'Permite escribir código asíncrono con sintaxis secuencial y legible, facilitando el manejo de errores con try/catch',
          'Hace que el código se ejecute en hilos del sistema operativo paralelos nativos',
          'Elimina la necesidad del Event Loop en el motor de JavaScript',
          'Aumenta automáticamente el ancho de banda de red en las peticiones'
        ],
        correct: 0,
        score: 2,
        category: 'Asincronía',
        difficulty: 'medium',
        feedback: 'async/await proporciona azúcar sintáctico sobre Promesas, haciendo que el flujo asíncrono se lea de forma limpia y lineal.'
      },
      {
        id: 'A-m-3',
        text: 'Empareja cada código de estado HTTP con su significado oficial según la RFC:',
        type: 'match',
        pairs: [
          { a: '201', b: 'Created (Recurso creado satisfactoriamente)' },
          { a: '400', b: 'Bad Request (Solicitud mal formada)' },
          { a: '401', b: 'Unauthorized (Autenticación requerida)' },
          { a: '500', b: 'Internal Server Error (Error interno del servidor)' }
        ],
        score: 3,
        category: 'HTTP & APIs',
        difficulty: 'medium',
        feedback: 'Los códigos 2xx indican éxito, 4xx errores del cliente y 5xx errores del servidor.'
      },
      {
        id: 'A-m-4',
        text: '¿Qué componente del patrón arquitectónico MVC es responsable de recibir las peticiones del usuario, invocar la lógica de negocio y seleccionar la vista adecuada?',
        type: 'multiple',
        options: ['Controlador (Controller)', 'Modelo (Model)', 'Vista (View)', 'Enrutador (Router)'],
        correct: 0,
        score: 2,
        category: 'Patrones de Arquitectura',
        difficulty: 'medium',
        feedback: 'El Controlador actúa como intermediario entre la Vista y el Modelo, orquestando las interacciones.'
      },
      {
        id: 'A-m-5',
        text: 'Verdadero o Falso: En Scrum, el Product Owner puede cambiar arbitrariamente los objetivos del Sprint en cualquier día sin consultar al equipo de desarrollo.',
        type: 'truefalse',
        correct: false,
        score: 2,
        category: 'Metodologías Ágiles',
        difficulty: 'medium',
        feedback: 'Falso. Una vez iniciado el Sprint, el objetivo del Sprint permanece fijo para garantizar el enfoque; solo se puede cancelar el Sprint si el objetivo queda obsoleto.'
      },
      {
        id: 'A-m-6',
        text: 'Si una consulta de base de datos demoraba 350 milisegundos y tras aplicar indexación en la columna clave se redujo en un 60%, ¿cuántos milisegundos tarda ahora?',
        type: 'numeric',
        correct: 140,
        tolerance: 2,
        score: 2,
        category: 'Optimización',
        difficulty: 'medium',
        feedback: '350 ms - (350 * 0.60) = 350 - 210 = 140 ms.'
      },
      {
        id: 'A-m-7',
        text: 'En Scrum, explica la diferencia conceptual entre la "Definition of Ready" (DoR) y la "Definition of Done" (DoD).',
        type: 'open',
        score: 3,
        category: 'Scrum',
        difficulty: 'medium',
        feedback: 'DoR define cuándo una historia de usuario está lista para entrar al Sprint (estimada, clara, sin bloqueos); DoD define cuándo un incremento está 100% terminado y listo para producción.'
      },
      {
        id: 'A-m-8',
        text: '¿Qué almacenamiento del navegador persiste los datos entre pestañas y sesiones, sin fecha de expiración automática?',
        type: 'multiple',
        options: ['localStorage', 'sessionStorage', 'Cookies de sesión', 'IndexedMemory Cache'],
        correct: 0,
        score: 2,
        category: 'Web Storage',
        difficulty: 'medium',
        feedback: 'localStorage almacena datos de forma persistente sin expiración, a diferencia de sessionStorage que expira al cerrar la pestaña.'
      }
    ],
    hard: [
      {
        id: 'A-h-1',
        text: '¿Cuáles de los siguientes son principios rectores de Clean Architecture y diseño de software desacoplado? (Selecciona todos los correctos)',
        type: 'checkbox',
        options: [
          'La regla de dependencia: el código interno nunca debe depender de librerías o detalles externos',
          'Separación de responsabilidades mediante casos de uso independientes de frameworks',
          'Acoplamiento estricto de la lógica de negocio a los esquemas de base de datos relacional',
          'Inversión de dependencias para facilitar el testing unitario y mocks'
        ],
        corrects: [0, 1, 3],
        score: 4,
        category: 'Arquitectura Limpia',
        difficulty: 'hard',
        feedback: 'La lógica de negocio central de Clean Architecture es independiente de frameworks, UI y bases de datos.'
      },
      {
        id: 'A-h-2',
        text: '¿Cómo garantiza un JWT (JSON Web Token) la integridad de sus datos para que un cliente no pueda modificar su rol de usuario?',
        type: 'multiple',
        options: [
          'A través de la firma criptográfica (Signature) calculada con una clave secreta del servidor sobre el header y payload',
          'Encriptando todo el token para que sea ilegible en el navegador',
          'Guardando una copia idéntica del payload en la memoria RAM del cliente',
          'Validando la dirección MAC del computador cliente en cada solicitud'
        ],
        correct: 0,
        score: 3,
        category: 'Seguridad Web',
        difficulty: 'hard',
        feedback: 'La firma se genera con HMAC-SHA256 o RSA. Si un atacante modifica el payload, la firma ya no coincidirá con la calculada por el servidor.'
      },
      {
        id: 'A-h-3',
        text: 'Empareja cada técnica de optimización web moderna con su objetivo correspondiente:',
        type: 'match',
        pairs: [
          { a: 'Code Splitting', b: 'Dividir bundles de JS para cargar solo lo requerido por ruta' },
          { a: 'Tree Shaking', b: 'Eliminar código muerto no referenciado en el bundle final' },
          { a: 'Lazy Loading', b: 'Diferir la carga de imágenes y recursos pesados hasta ser visibles' },
          { a: 'CDN (Edge Caching)', b: 'Servir recursos estáticos desde servidores geográficamente cercanos' }
        ],
        score: 4,
        category: 'Rendimiento Frontend',
        difficulty: 'hard',
        feedback: 'Técnicas esenciales para mejorar métricas de Core Web Vitals (LCP, FID/INP, CLS).'
      },
      {
        id: 'A-h-4',
        text: '¿Qué patrón de diseño se utiliza habitualmente para registrar observadores que reaccionan a eventos o cambios de estado sin acoplar emisor y receptor?',
        type: 'multiple',
        options: ['Observer / Pub-Sub', 'Singleton', 'Adapter', 'Decorator'],
        correct: 0,
        score: 3,
        category: 'Patrones de Diseño',
        difficulty: 'hard',
        feedback: 'El patrón Observer define una relación uno a muchos donde los suscriptores reciben notificaciones de eventos automáticamente.'
      },
      {
        id: 'A-h-5',
        text: 'Verdadero o Falso: Un índice compuesto en PostgreSQL sobre `(ciudad, fecha)` puede acelerar eficientemente una consulta que filtra únicamente por `fecha` sin especificar `ciudad`.',
        type: 'truefalse',
        correct: false,
        score: 3,
        category: 'Bases de Datos',
        difficulty: 'hard',
        feedback: 'Falso. Los índices compuestos B-Tree funcionan de izquierda a derecha. Para que aplique a la segunda columna debe incluirse la primera columna en el filtro (leftmost prefix).'
      },
      {
        id: 'A-h-6',
        text: '¿Cuál es el valor del puerto por defecto utilizado por el motor de base de datos relacional PostgreSQL?',
        type: 'numeric',
        correct: 5432,
        tolerance: 0,
        score: 2,
        category: 'Infraestructura',
        difficulty: 'hard',
        feedback: 'PostgreSQL escucha por defecto en el puerto TCP 5432 (a diferencia de MySQL en 3306).'
      },
      {
        id: 'A-h-7',
        text: 'Califica del 1 al 10 tu nivel de autoconfianza y dominio para diseñar e implementar una arquitectura de microservicios con APIs tolerantes a fallos y circuit breakers:',
        type: 'scale',
        score: 2,
        category: 'Autoevaluación',
        difficulty: 'hard',
        feedback: 'Escala de autovaloración profesional revisada por el instructor.'
      },
      {
        id: 'A-h-8',
        text: 'Diseña y describe la estrategia de manejo de errores centralizado y logging estructurado que implementarías en una API Node.js/Express lista para producción.',
        type: 'open',
        score: 4,
        category: 'Diseño de Backend',
        difficulty: 'hard',
        feedback: 'Se evalúa el uso de middlewares de error en Express, clases personalizadas de error con códigos HTTP, logging con Winston/Pino en JSON y ocultamiento de trazas sensibles en producción.'
      }
    ]
  },
  B: {
    easy: [
      {
        id: 'B-e-1',
        text: '¿Qué es una clave foránea (Foreign Key) en una base de datos relacional?',
        type: 'multiple',
        options: [
          'Un campo que establece un vínculo entre datos de dos tablas, referenciando la clave primaria de otra tabla',
          'Una clave que solo pueden utilizar usuarios administradores extranjeros',
          'Un algoritmo de encriptación para contraseñas de usuarios',
          'Un índice temporal que se borra al cerrar la sesión'
        ],
        correct: 0,
        score: 1,
        category: 'Bases de Datos',
        difficulty: 'easy',
        feedback: 'La Foreign Key garantiza la integridad referencial relacionando registros entre tablas.'
      },
      {
        id: 'B-e-2',
        text: 'En lenguajes orientados a objetos como Java o C#, ¿qué define una interfaz (interface)?',
        type: 'multiple',
        options: [
          'Un contrato que especifica los métodos que una clase debe implementar, sin contener su implementación concreta',
          'Una ventana gráfica de usuario con botones y campos de texto',
          'Un archivo de configuración para la conexión a la base de datos',
          'Una variable global accesible por todos los hilos'
        ],
        correct: 0,
        score: 1,
        category: 'POO & Java',
        difficulty: 'easy',
        feedback: 'Una interfaz es un contrato abstracto que garantiza que las clases implementadoras provean comportamientos específicos.'
      },
      {
        id: 'B-e-3',
        text: '¿Cuál instrucción SQL se utiliza para añadir nuevos registros a una tabla existente?',
        type: 'multiple',
        options: ['INSERT INTO', 'UPDATE TABLE', 'ADD RECORD', 'CREATE ROW'],
        correct: 0,
        score: 1,
        category: 'SQL',
        difficulty: 'easy',
        feedback: '`INSERT INTO nombre_tabla (columnas) VALUES (valores)` es la sentencia DML estándar para insertar registros.'
      },
      {
        id: 'B-e-4',
        text: 'Verdadero o Falso: En SQL, la cláusula `WHERE` filtra filas antes de que se realicen agrupaciones con `GROUP BY`, mientras que `HAVING` filtra después de agrupar.',
        type: 'truefalse',
        correct: true,
        score: 1,
        category: 'SQL',
        difficulty: 'easy',
        feedback: 'Correcto. `WHERE` filtra registros individuales; `HAVING` filtra resultados agrupados o funciones agregadas (SUM, COUNT).'
      },
      {
        id: 'B-e-5',
        text: '¿Cuál es el puerto de red por defecto utilizado para el tráfico seguro y cifrado en el protocolo HTTPS?',
        type: 'numeric',
        correct: 443,
        tolerance: 0,
        score: 1,
        category: 'Redes y Seguridad',
        difficulty: 'easy',
        feedback: 'El puerto estándar de HTTPS es el 443 (HTTP no cifrado usa el puerto 80).'
      },
      {
        id: 'B-e-6',
        text: '¿Qué tipo de relación entre entidades requiere obligatoriamente una tabla intermedia (o asociativa) en un modelo relacional?',
        type: 'multiple',
        options: [
          'Muchos a Muchos (N:M)',
          'Uno a Uno (1:1)',
          'Uno a Muchos (1:N)',
          'Relación reflexiva unaria'
        ],
        correct: 0,
        score: 1,
        category: 'Modelado de Datos',
        difficulty: 'easy',
        feedback: 'Para romper la cardinalidad N:M en bases de datos relacionales normalizadas se crea una tabla intermedia con las claves foráneas de ambas tablas.'
      },
      {
        id: 'B-e-7',
        text: 'Explica qué es una excepción en programación y cómo se estructuran los bloques `try`, `catch` y `finally`.',
        type: 'open',
        score: 2,
        category: 'Control de Errores',
        difficulty: 'easy',
        feedback: 'Una excepción es un evento anómalo durante la ejecución. `try` contiene el código propenso a fallas, `catch` captura y maneja el error, y `finally` se ejecuta siempre para liberar recursos.'
      },
      {
        id: 'B-e-8',
        text: 'En Git, ¿cuál es la diferencia fundamental entre `git pull` y `git fetch`?',
        type: 'multiple',
        options: [
          '`git fetch` descarga los cambios remotos sin mezclarlos con la rama local; `git pull` hace fetch y luego ejecuta un merge automático',
          '`git pull` borra los cambios locales mientras que `git fetch` los conserva',
          'Ambos comandos son idénticos y solo varían según el sistema operativo',
          '`git fetch` envía cambios locales al servidor remoto'
        ],
        correct: 0,
        score: 1,
        category: 'Git',
        difficulty: 'easy',
        feedback: '`git pull = git fetch + git merge`. Usar `fetch` permite inspeccionar cambios antes de integrarlos al árbol local.'
      }
    ],
    medium: [
      {
        id: 'B-m-1',
        text: '¿Cuáles de las siguientes corresponden a las 4 propiedades fundamentales ACID de los motores de bases de datos transaccionales? (Selecciona todas las que apliquen)',
        type: 'checkbox',
        options: ['Atomicidad (Atomicity)', 'Consistencia (Consistency)', 'Aislamiento (Isolation)', 'Durabilidad (Durability)', 'Agilidad (Agility)'],
        corrects: [0, 1, 2, 3],
        score: 3,
        category: 'Bases de Datos',
        difficulty: 'medium',
        feedback: 'ACID garantiza confiabilidad: o todo ocurre o nada ocurre, respetando restricciones y persistiendo aún ante cortes de energía.'
      },
      {
        id: 'B-m-2',
        text: '¿Cuál es la diferencia entre un `INNER JOIN` y un `LEFT JOIN` en una consulta relacional SQL?',
        type: 'multiple',
        options: [
          '`INNER JOIN` solo devuelve filas cuando hay coincidencia en ambas tablas; `LEFT JOIN` devuelve todas las filas de la tabla izquierda aunque no haya coincidencia en la derecha',
          '`LEFT JOIN` solo funciona con claves numéricas mientras que `INNER JOIN` acepta cadenas',
          '`INNER JOIN` es más lento y borra registros nulos permanentemente',
          '`LEFT JOIN` ordena los resultados alfabéticamente por la columna izquierda'
        ],
        correct: 0,
        score: 2,
        category: 'SQL Avanzado',
        difficulty: 'medium',
        feedback: '`INNER JOIN` intersecta conjuntos; `LEFT JOIN` preserva todos los registros de la tabla izquierda rellenando con NULL si no hay match.'
      },
      {
        id: 'B-m-3',
        text: 'Empareja cada anotación esencial del ecosistema Spring Boot / JPA con su propósito arquitectónico:',
        type: 'match',
        pairs: [
          { a: '@RestController', b: 'Expone endpoints REST que devuelven respuestas serializadas en JSON' },
          { a: '@Service', b: 'Contiene la lógica de negocio y reglas de dominio de la aplicación' },
          { a: '@Repository', b: 'Encapsula el acceso a datos y operaciones CRUD en la base de datos' },
          { a: '@Entity', b: 'Mapea una clase Java a una tabla correspondiente en la base de datos' }
        ],
        score: 3,
        category: 'Backend & Spring',
        difficulty: 'medium',
        feedback: 'Anotaciones estándar para separar responsabilidades en una arquitectura en capas.'
      },
      {
        id: 'B-m-4',
        text: '¿Qué ventaja principal tienen las bases de datos NoSQL basadas en documentos (como MongoDB) frente a los esquemas relacionales?',
        type: 'multiple',
        options: [
          'Esquema dinámico y flexible que permite modelar estructuras jerárquicas y evolucionar sin migraciones rígidas de DDL',
          'Garantizan consistencia estricta en clústeres globales sin latencia alguna',
          'No requieren memoria RAM para ejecutar consultas complejas',
          'Eliminan por completo la necesidad de crear índices para búsquedas rápidas'
        ],
        correct: 0,
        score: 2,
        category: 'Bases de Datos NoSQL',
        difficulty: 'medium',
        feedback: 'NoSQL documental permite almacenar JSON/BSON con esquemas variables, ideal para prototipado rápido y datos con estructuras dinámicas.'
      },
      {
        id: 'B-m-5',
        text: 'Verdadero o Falso: Un pool de conexiones (como HikariCP) crea y destruye una conexión TCP física con el motor de base de datos en cada petición HTTP de usuario.',
        type: 'truefalse',
        correct: false,
        score: 2,
        category: 'Rendimiento Backend',
        difficulty: 'medium',
        feedback: 'Falso. El pool mantiene un conjunto de conexiones abiertas reutilizables para evitar el alto costo de handshake TCP y autenticación en cada query.'
      },
      {
        id: 'B-m-6',
        text: 'En una consulta paginada `SELECT * FROM aprendices ORDER BY id LIMIT 15 OFFSET 30`, ¿cuántos registros se retornan como máximo?',
        type: 'numeric',
        correct: 15,
        tolerance: 0,
        score: 2,
        category: 'SQL',
        difficulty: 'medium',
        feedback: '`LIMIT 15` define el tamaño de página (máximo 15 registros), mientras que `OFFSET 30` salta los primeros 30.'
      },
      {
        id: 'B-m-7',
        text: 'Explica cómo implementarías el flujo completo de autenticación y autorización con JWT (desde el login del usuario hasta la protección de rutas protegidas).',
        type: 'open',
        score: 3,
        category: 'Seguridad Backend',
        difficulty: 'medium',
        feedback: 'Se evalúa: validación de credenciales, generación de token con claims y secreto/llave privada, envío en header Authorization Bearer y middleware de verificación en endpoints protegidos.'
      },
      {
        id: 'B-m-8',
        text: '¿Qué patrón de arquitectura separa las operaciones de lectura (queries) de las operaciones de modificación (commands) para optimizar el rendimiento y escalabilidad?',
        type: 'multiple',
        options: ['CQRS (Command Query Responsibility Segregation)', 'MVC', 'BFF (Backend for Frontend)', 'Microkernel'],
        correct: 0,
        score: 2,
        category: 'Patrones Arquitectónicos',
        difficulty: 'medium',
        feedback: 'CQRS permite optimizar modelos de lectura de forma independiente de los modelos transaccionales de escritura.'
      }
    ],
    hard: [
      {
        id: 'B-h-1',
        text: '¿Cuáles de las siguientes medidas son indispensables para proteger una aplicación web contra vulnerabilidades de Inyección SQL (SQLi)? (Selecciona todas las correctas)',
        type: 'checkbox',
        options: [
          'Uso de Consultas Preparadas (Prepared Statements) con binding parametrizado',
          'Uso de ORMs modernos (Hibernate, Prisma, TypeORM) que parametrizan queries',
          'Concatenar cadenas directamente en las sentencias SQL para ganar velocidad',
          'Validación estricta y tipado de las entradas del usuario'
        ],
        corrects: [0, 1, 3],
        score: 4,
        category: 'Ciberseguridad',
        difficulty: 'hard',
        feedback: 'Las consultas preparadas aseguran que el motor de BD interprete los parámetros como datos y nunca como código ejecutable.'
      },
      {
        id: 'B-h-2',
        text: 'En control de concurrencia y aislamiento transaccional, ¿cuál es el nivel de aislamiento más estricto que previene lecturas sucias, no repetibles y lecturas fantasma?',
        type: 'multiple',
        options: ['SERIALIZABLE', 'REPEATABLE READ', 'READ COMMITTED', 'READ UNCOMMITTED'],
        correct: 0,
        score: 3,
        category: 'Concurrencia en BD',
        difficulty: 'hard',
        feedback: 'SERIALIZABLE ejecuta transacciones como si ocurrieran secuencialmente una tras otra, eliminando cualquier anomalía de concurrencia.'
      },
      {
        id: 'B-h-3',
        text: 'Empareja cada algoritmo clásico de ordenamiento con su complejidad temporal en el caso promedio:',
        type: 'match',
        pairs: [
          { a: 'QuickSort', b: 'O(n log n) en promedio por técnica divide y vencerás' },
          { a: 'MergeSort', b: 'O(n log n) garantizado en el peor y mejor caso con espacio O(n)' },
          { a: 'BubbleSort', b: 'O(n²) debido a comparaciones de pares adyacentes' },
          { a: 'Búsqueda Binaria', b: 'O(log n) sobre arreglos previamente ordenados' }
        ],
        score: 4,
        category: 'Algoritmos y Complejidad',
        difficulty: 'hard',
        feedback: 'El análisis asintótico de Big O es crucial para anticipar el comportamiento de sistemas ante grandes volúmenes de datos.'
      },
      {
        id: 'B-h-4',
        text: 'Verdadero o Falso: En Docker, múltiples contenedores pueden ejecutarse enlazados al mismo puerto del Host (ej: puerto 80 del host) sin generar conflicto de enlace (port collision).',
        type: 'truefalse',
        correct: false,
        score: 3,
        category: 'DevOps & Contenedores',
        difficulty: 'hard',
        feedback: 'Falso. Solo un proceso o contenedor puede vincular un puerto específico de la interfaz de red del Host a la vez; si otro contenedor intenta usar el mismo puerto ocurrirá un error "address already in use".'
      },
      {
        id: 'B-h-5',
        text: '¿Cómo organiza la memoria el Garbage Collector en la Java Virtual Machine (JVM) para recolectar objetos de ciclo de vida corto?',
        type: 'multiple',
        options: [
          'Mediante generaciones: Young Generation (Eden y Survivor spaces) y Old/Tenured Generation',
          'Almacenando todos los objetos en el Call Stack de los hilos de ejecución',
          'Eliminando objetos manualmente cuando el programador llama a free()',
          'Bloqueando el sistema operativo cada 60 segundos completos'
        ],
        correct: 0,
        score: 3,
        category: 'JVM Internals',
        difficulty: 'hard',
        feedback: 'La hipótesis generacional asume que la mayoría de objetos mueren jóvenes, optimizando la recolección en la Young Generation sin pausar la Old Generation frecuentemente.'
      },
      {
        id: 'B-h-6',
        text: '¿Cuál es el valor del puerto de red asignado por defecto al motor de base de datos MySQL / MariaDB?',
        type: 'numeric',
        correct: 3306,
        tolerance: 0,
        score: 2,
        category: 'Infraestructura',
        difficulty: 'hard',
        feedback: 'MySQL y MariaDB operan en el puerto TCP 3306.'
      },
      {
        id: 'B-h-7',
        text: 'En una escala del 1 al 10, ¿cómo calificas tu capacidad para diagnosticar y optimizar consultas SQL lentas analizando el plan de ejecución (`EXPLAIN ANALYZE` / Execution Plan)?',
        type: 'scale',
        score: 2,
        category: 'Autoevaluación Técnica',
        difficulty: 'hard',
        feedback: 'Escala de autoevaluación revisada por el evaluador en el panel de administración.'
      },
      {
        id: 'B-h-8',
        text: 'Analiza los pros y contras de migrar un sistema monolítico de información a una arquitectura de microservicios en una entidad pública o corporación grande.',
        type: 'open',
        score: 4,
        category: 'Arquitectura Empresarial',
        difficulty: 'hard',
        feedback: 'Pros: despliegues independientes, escalado granular, heterogeneidad tecnológica. Contras: complejidad distribuida, consistencia eventual, orquestación y monitoreo más difícil.'
      }
    ]
  },
  C: {
    easy: [
      {
        id: 'C-e-1',
        text: '¿Qué es un requerimiento funcional en el contexto del análisis y desarrollo de software?',
        type: 'multiple',
        options: [
          'Una declaración que describe un comportamiento, función o servicio específico que el sistema debe realizar para el usuario',
          'Una especificación de la velocidad de CPU mínima del servidor',
          'El costo económico del software estipulado en el contrato',
          'El color y tipografía de los botones de la interfaz gráfica'
        ],
        correct: 0,
        score: 1,
        category: 'Ingeniería de Requerimientos',
        difficulty: 'easy',
        feedback: 'Los requerimientos funcionales definen "qué" debe hacer el sistema ante entradas específicas.'
      },
      {
        id: 'C-e-2',
        text: '¿Qué es una prueba unitaria (Unit Test)?',
        type: 'multiple',
        options: [
          'Una prueba automatizada que verifica el comportamiento aislado de la unidad más pequeña de código (ej: una función o método)',
          'Una prueba que evalúa la velocidad de la conexión a internet del cliente',
          'Un examen que se aplica a un solo programador del equipo',
          'Una prueba manual de extremo a extremo que realiza el cliente final'
        ],
        correct: 0,
        score: 1,
        category: 'Calidad y Testing',
        difficulty: 'easy',
        feedback: 'Las pruebas unitarias son rápidas, independientes y prueban bloques individuales sin dependencias externas.'
      },
      {
        id: 'C-e-3',
        text: '¿Para qué se utiliza la herramienta Docker en el desarrollo y despliegue de software?',
        type: 'multiple',
        options: [
          'Para empaquetar una aplicación con todas sus dependencias en un contenedor ligero y reproducible',
          'Para diseñar diagramas de base de datos relacionales',
          'Como editor de código fuente en la nube',
          'Para calcular la nómina del equipo de desarrollo'
        ],
        correct: 0,
        score: 1,
        category: 'DevOps',
        difficulty: 'easy',
        feedback: 'Docker garantiza que el software se ejecute de manera idéntica en desarrollo, staging y producción ("funciona en mi máquina y en el servidor").'
      },
      {
        id: 'C-e-4',
        text: '¿Qué artefacto de Scrum contiene la lista única, ordenada y priorizada de todo lo que se sabe que es necesario en el producto?',
        type: 'multiple',
        options: ['Product Backlog', 'Sprint Backlog', 'Incremento', 'Definition of Done'],
        correct: 0,
        score: 1,
        category: 'Scrum',
        difficulty: 'easy',
        feedback: 'El Product Backlog es gestionado por el Product Owner y evoluciona continuamente con las necesidades del negocio.'
      },
      {
        id: 'C-e-5',
        text: 'Verdadero o Falso: Una prueba de regresión tiene como objetivo comprobar que una nueva modificación de código no haya introducido errores en funcionalidades que antes operaban correctamente.',
        type: 'truefalse',
        correct: true,
        score: 1,
        category: 'Testing',
        difficulty: 'easy',
        feedback: 'Correcto. Las pruebas de regresión evitan que correcciones o nuevas funciones rompan módulos existentes.'
      },
      {
        id: 'C-e-6',
        text: '¿Cuántos minutos como máximo suele durar la reunión diaria de sincronización (Daily Scrum) según la guía oficial de Scrum?',
        type: 'numeric',
        correct: 15,
        tolerance: 0,
        score: 1,
        category: 'Scrum Ceremonias',
        difficulty: 'easy',
        feedback: 'La Daily es una reunión de tiempo fijo (timebox) de 15 minutos para sincronizar el progreso hacia el Objetivo del Sprint.'
      },
      {
        id: 'C-e-7',
        text: '¿Por qué las variables de entorno sensibles (como contraseñas de BD y claves de API privadas) nunca deben commitearse en un repositorio Git?',
        type: 'open',
        score: 2,
        category: 'Seguridad en DevOps',
        difficulty: 'easy',
        feedback: 'Subir credenciales a repositorios expone los sistemas a accesos no autorizados e intrusiones; las contraseñas quedan registradas en el historial de Git para siempre si no se purgan.'
      },
      {
        id: 'C-e-8',
        text: '¿Qué archivo se utiliza en Git para indicar intencionalmente qué carpetas o archivos no deben ser rastreados ni subidos?',
        type: 'multiple',
        options: ['.gitignore', '.gitconfig', '.gitkeep', 'README.md'],
        correct: 0,
        score: 1,
        category: 'Git',
        difficulty: 'easy',
        feedback: 'El archivo `.gitignore` enumera patrones de archivos temporales, builds (`dist/`, `node_modules/`) y secretos (`.env`).'
      }
    ],
    medium: [
      {
        id: 'C-m-1',
        text: '¿Cuáles de las siguientes prácticas son estándares en un flujo de Integración Continua (CI)? (Selecciona todas las que apliquen)',
        type: 'checkbox',
        options: [
          'Ejecución automatizada de pruebas unitarias en cada push o Pull Request',
          'Análisis estático de código (linters y escaneo de vulnerabilidades)',
          'Compilación automatizada del proyecto para verificar que no haya errores de build',
          'Desplegar directamente a producción sin validación ni staging previo'
        ],
        corrects: [0, 1, 2],
        score: 3,
        category: 'CI/CD',
        difficulty: 'medium',
        feedback: 'CI busca detectar defectos de forma temprana mediante compilación y pruebas automáticas en cada integración.'
      },
      {
        id: 'C-m-2',
        text: '¿Cuál es el rol de un archivo `Dockerfile` en un proyecto de software?',
        type: 'multiple',
        options: [
          'Un documento de texto que contiene todas las instrucciones y comandos secuenciales necesarios para construir una imagen de contenedor',
          'Un script para reiniciar automáticamente el router de red',
          'El archivo donde se almacenan las copias de seguridad de la base de datos',
          'Un certificado de seguridad SSL para servidores web'
        ],
        correct: 0,
        score: 2,
        category: 'Docker',
        difficulty: 'medium',
        feedback: 'El `Dockerfile` define la imagen base, copia archivos, instala dependencias y declara el comando de inicio del contenedor.'
      },
      {
        id: 'C-m-3',
        text: 'Empareja cada nivel de pruebas de software con su ámbito de validación:',
        type: 'match',
        pairs: [
          { a: 'Pruebas Unitarias', b: 'Verifican funciones y métodos individuales de manera aislada' },
          { a: 'Pruebas de Integración', b: 'Verifican la interacción entre módulos, servicios o base de datos' },
          { a: 'Pruebas End-to-End (E2E)', b: 'Simulan el flujo completo del usuario final a través de la interfaz' },
          { a: 'Pruebas de Carga/Estrés', b: 'Evalúan la estabilidad y rendimiento del sistema bajo alto tráfico' }
        ],
        score: 3,
        category: 'Pirámide de Testing',
        difficulty: 'medium',
        feedback: 'La pirámide de testing sugiere una base amplia de pruebas unitarias rápidas y menos pruebas E2E lentas pero críticas.'
      },
      {
        id: 'C-m-4',
        text: '¿Qué responsabilidad tiene el Scrum Master cuando surgen impedimentos organizacionales que bloquean al equipo de desarrollo?',
        type: 'multiple',
        options: [
          'Actuar como facilitador y líder servicial, trabajando activamente para remover los impedimentos y proteger al equipo',
          'Asignar horas extras obligatorias a los desarrolladores',
          'Reescribir el código fuente para resolver el problema él mismo',
          'Reducir el salario de los integrantes del equipo'
        ],
        correct: 0,
        score: 2,
        category: 'Scrum Liderazgo',
        difficulty: 'medium',
        feedback: 'El Scrum Master sirve al equipo eliminando barreras que obstaculicen el cumplimiento del objetivo.'
      },
      {
        id: 'C-m-5',
        text: 'Verdadero o Falso: En la metodología TDD (Test-Driven Development), el ciclo fundamental es: primero escribir la prueba que falle (Red), luego escribir el código mínimo para que pase (Green), y finalmente refactorizar (Refactor).',
        type: 'truefalse',
        correct: true,
        score: 2,
        category: 'TDD',
        difficulty: 'medium',
        feedback: 'Correcto. El ciclo Red-Green-Refactor guía el diseño del código guiado por pruebas antes de la implementación.'
      },
      {
        id: 'C-m-6',
        text: 'Si un equipo Scrum mantiene una velocidad promedio de 22 puntos de historia por Sprint, ¿cuántos Sprints completos requerirá para completar un backlog estimado en 88 puntos?',
        type: 'numeric',
        correct: 4,
        tolerance: 0,
        score: 2,
        category: 'Métricas Ágiles',
        difficulty: 'medium',
        feedback: '88 puntos / 22 puntos por sprint = 4 sprints.'
      },
      {
        id: 'C-m-7',
        text: 'Describe qué elementos y criterios de aceptación incluirías en la "Definition of Done" (DoD) de un equipo para considerar una historia de usuario lista para entregar.',
        type: 'open',
        score: 3,
        category: 'Calidad de Software',
        difficulty: 'medium',
        feedback: 'Criterios clave: código revisado por pares (code review), pruebas unitarias pasando con cobertura mínima, documentación actualizada, sin vulnerabilidades críticas y desplegado en ambiente de pruebas.'
      },
      {
        id: 'C-m-8',
        text: '¿Qué es una arquitectura de microservicios comparada con una monolítica?',
        type: 'multiple',
        options: [
          'Una colección de pequeños servicios autónomos, débilmente acoplados, desplegables independientemente y organizados alrededor de capacidades del negocio',
          'Un único ejecutable gigantesco que contiene toda la base de datos y la interfaz en un solo archivo binario',
          'Un software que solo se ejecuta en microprocesadores de teléfonos inteligentes',
          'Un programa sin código backend que corre completamente en un archivo HTML'
        ],
        correct: 0,
        score: 2,
        category: 'Arquitectura de Software',
        difficulty: 'medium',
        feedback: 'Los microservicios ofrecen escalabilidad y resiliencia independiente, comunicándose mediante protocolos ligeros como HTTP/REST o gRPC.'
      }
    ],
    hard: [
      {
        id: 'C-h-1',
        text: '¿Cuáles de los siguientes corresponden a vectores de riesgo reconocidos en el OWASP Top 10 para aplicaciones web? (Selecciona todos los correctos)',
        type: 'checkbox',
        options: [
          'Broken Access Control (Falla en el control de acceso)',
          'Cryptographic Failures (Fallas criptográficas / transmisión en texto plano)',
          'Injection (Inyección de comandos o SQL)',
          'Uso de tipografía sans-serif en lugar de serif'
        ],
        corrects: [0, 1, 2],
        score: 4,
        category: 'OWASP Seguridad',
        difficulty: 'hard',
        feedback: 'El OWASP Top 10 documenta los riesgos más críticos de seguridad en software web moderno.'
      },
      {
        id: 'C-h-2',
        text: '¿Cuál es la función principal de Kubernetes frente a ejecutar contenedores de Docker manualmente en un servidor?',
        type: 'multiple',
        options: [
          'Orquestación automatizada de contenedores: auto-escalado, auto-recuperación (self-healing), balanceo de carga y despliegues progresivos en clústeres',
          'Compilar código fuente Java y C# a lenguaje ensamblador',
          'Proveer una interfaz de edición gráfica para diseñadores web',
          'Actuar como motor de base de datos relacional para analítica'
        ],
        correct: 0,
        score: 3,
        category: 'Kubernetes & Cloud',
        difficulty: 'hard',
        feedback: 'Kubernetes gestiona el ciclo de vida de los contenedores a escala, reiniciando pods caídos y distribuyendo tráfico eficientemente.'
      },
      {
        id: 'C-h-3',
        text: 'Empareja cada estrategia de despliegue continuo con su mecanismo de funcionamiento:',
        type: 'match',
        pairs: [
          { a: 'Blue-Green', b: 'Mantiene dos entornos idénticos y conmuta el router al nuevo al estar listo' },
          { a: 'Canary Deployment', b: 'Despliega la nueva versión a un porcentaje pequeño de usuarios (ej: 5%) antes del 100%' },
          { a: 'Rolling Update', b: 'Reemplaza instancias antiguas gradualmente una a una sin tiempo de inactividad' },
          { a: 'Recreate', b: 'Apaga todas las instancias viejas antes de encender las nuevas con downtime breve' }
        ],
        score: 4,
        category: 'Estrategias de Despliegue',
        difficulty: 'hard',
        feedback: 'Estrategias diseñadas para minimizar riesgos de regresión y eliminar o controlar tiempos de indisponibilidad.'
      },
      {
        id: 'C-h-4',
        text: 'Verdadero o Falso: En un modelo de computación Serverless (como Google Cloud Run o AWS Lambda), la plataforma escala automáticamente a cero (Scale to Zero) cuando no hay solicitudes entrantes, sin incurrir en costos de cómputo en reposo.',
        type: 'truefalse',
        correct: true,
        score: 3,
        category: 'Cloud Serverless',
        difficulty: 'hard',
        feedback: 'Correcto. El modelo Serverless cobra únicamente por los milisegundos de cómputo utilizados durante la atención activa de peticiones.'
      },
      {
        id: 'C-h-5',
        text: '¿Cómo mitiga una arquitectura en la nube los ataques de denegación de servicio distribuido (DDoS) a nivel de infraestructura?',
        type: 'multiple',
        options: [
          'Mediante servicios de mitigación perimetral (Anycast DNS, Web Application Firewalls - WAF, y absorción elástica de tráfico)',
          'Apagando manualmente los switches del centro de datos',
          'Cambiando la contraseña del usuario root del servidor',
          'Incrementando el tamaño del disco duro del servidor principal'
        ],
        correct: 0,
        score: 3,
        category: 'Seguridad en la Nube',
        difficulty: 'hard',
        feedback: 'Las redes Anycast globales y WAFs distribuidos inspeccionan y filtran tráfico malicioso antes de que sature los servidores de aplicación.'
      },
      {
        id: 'C-h-6',
        text: 'Si un equipo necesita un tiempo de disponibilidad del 99.9% (tres nueves) en el año, ¿cuántas horas de inactividad (downtime) no planificadas se permiten como máximo en 365 días? (365 días × 24 horas = 8.760 horas; calcula el 0.1% redondeado al entero más cercano)',
        type: 'numeric',
        correct: 9,
        tolerance: 1,
        score: 2,
        category: 'Alta Disponibilidad (SLA)',
        difficulty: 'hard',
        feedback: '8760 horas × 0.001 = 8.76 horas ≈ 9 horas al año.'
      },
      {
        id: 'C-h-7',
        text: 'Califica del 1 al 10 tu preparación técnica para auditar la seguridad de un pipeline de CI/CD y gestionar secretos de infraestructura en entornos de producción:',
        type: 'scale',
        score: 2,
        category: 'Autoevaluación DevOps',
        difficulty: 'hard',
        feedback: 'Valoración subjetiva sobre madurez en DevSecOps revisada en el panel de administración.'
      },
      {
        id: 'C-h-8',
        text: 'Presenta un plan de contingencia detallado para responder ante la caída súbita del servidor de base de datos principal en una hora de alto tráfico en una entidad educativa.',
        type: 'open',
        score: 4,
        category: 'Disaster Recovery',
        difficulty: 'hard',
        feedback: 'Se evalúa: alertas de monitoreo, conmutación por error (failover) a réplica de lectura promovida a primaria, página de mantenimiento degradada graciosa, restauración desde backups (RPO/RTO) y post-mortem del incidente.'
      }
    ]
  }
};
