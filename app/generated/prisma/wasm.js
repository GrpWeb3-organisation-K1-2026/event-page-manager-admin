
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.2.1
 * Query Engine version: 4123509d24aa4dede1e864b46351bf2790323b69
 */
Prisma.prismaVersion = {
  client: "6.2.1",
  engine: "4123509d24aa4dede1e864b46351bf2790323b69"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.EventScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  startDate: 'startDate',
  endDate: 'endDate',
  place: 'place'
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  startDate: 'startDate',
  endDate: 'endDate',
  capacity: 'capacity',
  roomId: 'roomId',
  eventId: 'eventId'
};

exports.Prisma.RoomScalarFieldEnum = {
  id: 'id',
  name: 'name'
};

exports.Prisma.SpeakerScalarFieldEnum = {
  id: 'id',
  fullName: 'fullName',
  photo: 'photo',
  biography: 'biography',
  links: 'links'
};

exports.Prisma.SessionSpeakerScalarFieldEnum = {
  sessionId: 'sessionId',
  speakerId: 'speakerId'
};

exports.Prisma.QuestionScalarFieldEnum = {
  id: 'id',
  content: 'content',
  name: 'name',
  upvotes: 'upvotes',
  createdAt: 'createdAt',
  sessionId: 'sessionId'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Event: 'Event',
  Session: 'Session',
  Room: 'Room',
  Speaker: 'Speaker',
  SessionSpeaker: 'SessionSpeaker',
  Question: 'Question'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\Dell\\web3\\event-page-manager\\event-page-manager\\app\\generated\\prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters"
    ],
    "sourceFilePath": "C:\\Users\\Dell\\web3\\event-page-manager\\event-page-manager\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "6.2.1",
  "engineVersion": "4123509d24aa4dede1e864b46351bf2790323b69",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": true,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider        = \"prisma-client-js\"\n  output          = \"../app/generated/prisma\"\n  previewFeatures = [\"driverAdapters\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel Event {\n  id          Int       @id @default(autoincrement())\n  title       String\n  description String\n  startDate   DateTime\n  endDate     DateTime\n  place       String\n  sessions    Session[]\n}\n\nmodel Session {\n  id          Int      @id @default(autoincrement())\n  title       String\n  description String\n  startDate   DateTime\n  endDate     DateTime\n  capacity    Int\n  roomId      Int\n  eventId     Int\n\n  event     Event            @relation(fields: [eventId], references: [id])\n  room      Room             @relation(fields: [roomId], references: [id])\n  questions Question[]\n  speakers  SessionSpeaker[]\n}\n\nmodel Room {\n  id       Int       @id @default(autoincrement())\n  name     String\n  sessions Session[]\n}\n\nmodel Speaker {\n  id        Int     @id @default(autoincrement())\n  fullName  String\n  photo     String?\n  biography String\n  links     Json?\n\n  sessions SessionSpeaker[]\n}\n\nmodel SessionSpeaker {\n  sessionId Int\n  speakerId Int\n\n  session Session @relation(fields: [sessionId], references: [id])\n  speaker Speaker @relation(fields: [speakerId], references: [id])\n\n  @@id([sessionId, speakerId])\n}\n\nmodel Question {\n  id        Int      @id @default(autoincrement())\n  content   String\n  name      String?\n  upvotes   Int      @default(0)\n  createdAt DateTime @default(now())\n\n  sessionId Int\n  session   Session @relation(fields: [sessionId], references: [id])\n}\n",
  "inlineSchemaHash": "286d3f0249baf200ac22d5b88903ff2fca6360c5a51f7484bf16d3053bf7f463",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Event\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"startDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"endDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"place\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sessions\",\"kind\":\"object\",\"type\":\"Session\",\"relationName\":\"EventToSession\"}],\"dbName\":null},\"Session\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"startDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"endDate\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"capacity\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"roomId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"eventId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"event\",\"kind\":\"object\",\"type\":\"Event\",\"relationName\":\"EventToSession\"},{\"name\":\"room\",\"kind\":\"object\",\"type\":\"Room\",\"relationName\":\"RoomToSession\"},{\"name\":\"questions\",\"kind\":\"object\",\"type\":\"Question\",\"relationName\":\"QuestionToSession\"},{\"name\":\"speakers\",\"kind\":\"object\",\"type\":\"SessionSpeaker\",\"relationName\":\"SessionToSessionSpeaker\"}],\"dbName\":null},\"Room\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"sessions\",\"kind\":\"object\",\"type\":\"Session\",\"relationName\":\"RoomToSession\"}],\"dbName\":null},\"Speaker\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"fullName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"photo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"biography\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"links\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"sessions\",\"kind\":\"object\",\"type\":\"SessionSpeaker\",\"relationName\":\"SessionSpeakerToSpeaker\"}],\"dbName\":null},\"SessionSpeaker\":{\"fields\":[{\"name\":\"sessionId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"speakerId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"session\",\"kind\":\"object\",\"type\":\"Session\",\"relationName\":\"SessionToSessionSpeaker\"},{\"name\":\"speaker\",\"kind\":\"object\",\"type\":\"Speaker\",\"relationName\":\"SessionSpeakerToSpeaker\"}],\"dbName\":null},\"Question\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"content\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"upvotes\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"sessionId\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"session\",\"kind\":\"object\",\"type\":\"Session\",\"relationName\":\"QuestionToSession\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine 
  }
}

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

