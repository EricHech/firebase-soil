- Note: To update the package, bump the version, push to git, and `npm publish`. Then open `firebase-hech-ui`, run `yarn firebase-hech`, bump the version, push to git, and `npm publish`.

# Acknowledgements

This project is based on the original work by [Daniel Murawsky](https://github.com/dmurawsky). Their contributions laid the foundation for this project.

# Firebase Hech Documentation

firebase-hech is a strongly-typed opinionated wrapper around Firebase's Real-Time Database meant to supercharge Firebase and allow for better relational management and out-of-the-box security rules. It comes with a lot of other features as well, such as type-safety, easy authentication, and solutions for pagination, infinite scroll, and more as built-in results to using database keys effectively.

For more information about the security rules, the understanding of which is essential to using firebase-hech, read the documentation found in `database.rules.js`. To make changes to the rules, copy this file out and run it as a node script in your repo to generate a rules json file.

For help managing data on the front-end, the sister package `firebase-hech-ui` includes a nearly exhaustive list of helper functions, hooks, context generators, and components that make working with firebase-hech and building a serverless architecture nearly effortless.

## Initial Setup

Pull in the `FirebaseHechContextProviderComponent` and use it like so:

```tsx
<FirebaseHechContextProviderComponent firebaseOptions={FIREBASE_OPTIONS}>
  {yourAppHere}
</FirebaseHechContextProviderComponent>
```

This will initialize the database connection.

## Authentication

We provide authentication helper functions which will work once nested in the `FirebaseHechContextProviderComponent`. A good place to start is to simply use the `signUp` and `signIn` functions, but check here for more:

- `firebase-hech/services/auth.ts`

An even faster approach would be to use the given components:

- `firebase-hech-ui/SignUp/index.tsx`
- `firebase-hech-ui/SignUp/index.tsx`

## Data Types

The first step to building a project with firebase-hech is to think about your data types and begin building them out. To do this, navigate from the root to `@types/firebase-hech/index.d.ts` and paste the following:

```ts
import * as firebaseHechTypes from "firebase-hech";

declare module "firebase-hech" {
  export interface FirebaseHechDatabase extends firebaseHechTypes.FirebaseHechDatabase {
    /** Example JS Doc explaining the `manager` dataType */
    manager: { firstName: string; lastName: string };
  }
}
```

This will set firebase-hech up to receive the proper types. Now begin building out your types, likely importing them from another file and assigning them to the relevant keys here. For example, you might have a data type for each of the following: `manager`, `user`, `profile`, `project`, and `message`.

The structure that will be saved is as follows: `data/user/{uid}/userData` where `userData` will include the information provided in your type plus a few firebase-hech-things (such as permissions and timestamps).

## Data Keys

A data key is simply the key for accessing a particular instance of a data type. For example, the uid of a user is the data key for the user data type. You can use Firebase Push Keys for your data keys, but when possible, FirebaseHech really shines when you get creative with your keys. For example, the data key to a message could be `{userId}::{projectId}::{pushKey}`. In this way, without even fetching the message data, with the key alone you would be able to fetch the user who created the message and the project that the message is under.

To generate keys like this, use the `generateDbKey` function, and the parse the same, use `parseDbKey`:

```ts
const key = generateDbKey("{userId}", "{projectId}", "{pushKey}");
const [userId, projectId, pushKey] = parseDbKey();
```

This is part of why the JS Docs are so important. Make sure that each data type has a doc explaining how it is keyed and any other useful information, such as what it will be connected to and its role in the database architecture.

## Connection Data Lists (CDL)

Connecting data together is how we make FirebaseHech relational. Any time data is created or updated (using `createData` or `updateData`) you can pass in a list of connections. You can also directly call `createConnection`. This creates a two-way connection between two data types, for example, between a user and all of the projects that user is managing.

As such, you can use firebase-hech functions to then get all of the connected data of a particular thing. For example, when you render a user's project list, you simply fetch all the connected projects' data for that user. Inversely, for a project, you could fetch all connected users' data.

If you want to create a unique list of existing data of any kind, you can do so by adding that list as an empty object in the types file like so:

```ts
import * as firebaseHechTypes from "firebase-hech";

declare module "firebase-hech" {
  export interface FirebaseHechDatabase extends firebaseHechTypes.FirebaseHechDatabase {
    manager: { firstName: string; lastName: string };
    user: { email: string };
    favorite: {};
  }
}
```

For example, if you have all of your users under the `user` data type but want to save a specific sublist of users, you would make a `favorite` data type that does not directly have any data because it is simply a list referencing the user data type. You would create a connection between a `manager` and a `favorite` using the `{uid}` of the favorited `user`. You would then be able to save, fetch, and remove favorited users of the manager this way, simply by creating and removing connections between `manager` and `favorite` via `user` `{uid}`.

## User Data Lists (UDL)

User data lists are similar to connection data lists, but they are less flexible and specifically connect a user to a piece of data (rather than a piece of data to another piece of data). This exists to tie into the security system. Just like you can set `connections`, you can also set `owners`, and the owner of a piece of data has priviledges to modify that data.

## A Warning Regarding CDL/UDL

When creating connections it is important to consider their impact when making updates. If something is connected to a lot of data, like a `chat` to 100k `message`s, then an update to the `chat` (e.g. changing `chat.name`) would require fetching and updating 100k nodes on the CDL. This is not good.

There are two possible solutions. In this instance, you should create an empty connection object like in the above example that references `favorite`. In this case, create something called `chatContent`. This allows you to make an update to `chat` without ever triggering the CDL because all of the `message`s are connected to the empty `chatContent` node as opposed to the `chat` node. The downside is that updates to a `message` won't signal the `chat`. But in this case, we would never care about that relationship, so this is exactly what we want.

Another way to prevent triggering the CDL on a per update basis is to pass in `makeGetRequests: false` to `updateData`. This has the same effect of preventing the fetching and consequently updating of 100k `message` CDL nodes. This is a less ideal solution in this scenario but could be more relevant in another case.

All this being said, anyone listening directly do the data itself via `useDataKeyValue` will always get updates regardless of the `CDL/UDL`. If a user is listening directly to the `chat`, for example, even without updating the CLD, the user will still get the update.

Imagine you are displaying a list of chats and want to always get their updates without relying on the CDL: You can fetch of the CDL list (`getConnectionType` as opposed to `useConnections`) and then iterate over that list, rendering a new component for each one. That component in turn has within it a `useDataKeyValue`. In this way, you fetch the full list and then listen directly to the data.

With the above approach, you won't get additions/removals to the full CDL - it isn't updating anyway - but you will get all updates to the data itself.

## Security Access

In order to read data:

- The the user must either own the data or be connected to the data or...
- The data must be set as `publicAccess: true` or have the appropriate `connectionAccess`.

We should explain the `connectionAccess`, so an example is provided below:

```ts
await createData({
  data,
  dataKey,
  dataType: "project",
  owners: [managerKey],
  connectionAccess: {
    connectionKey: managerKey,
    connectionType: "manager",
    uidDataType: "user",
    read: true,
    write: true,
  },
});
```

Here, we are saying that any `user` that is connected to the `manager` that owns this `project` also has access to read and write this `project`. There is also an `ownershipAccess` option that works the same way, but with ownership rather than connection.

## Remote Request

There is one other way to have read/write access to data. This is by setting `remoteRequestUid`. This is not intended to determine ownership. This value, once set, cannot be changed, and it can only be set to your own uid. It is meant for creating remote request objects: `data/remoteRequest/dataKey/{object}`.

Remote request objects are a concept whereby one user can make a request on behalf of another user via an API. For example, a manager sends an invite link to a new employee with a special key to a remote request. Upon logging in, this key is sent to the API which makes the remote request using the same permissions as the manager indicated by the `remoteRequestUid`. In the API, this is done via `initializeAdminRemoteRequestApp` instead of `initializeAdminApp`.

In this way, a manager can add people to his team through the API while retaining the same database security rules as if he were to make this operation client-side.

## Once/Get/On/Use

Firebase has a terminology which we have tried to extend: `onValue` and `onceValue`. The `on` represents an open data connection using Firebase's built-in websockets. Use this when you want a live subscription to the data. This is often likely the default. Sometimes, though, that is unnecessary. If you only need to fetch the data as in a normal CRUD API, you use `once`.

We have mostly extended this terminlogy, but we sometimes use (1) `get` instead of `once` and (2) `use` instead of `on` for reasons explained in the following section.

## CRUD Operations

There are too many helper functions to mention here. It suffices to say that if there is a `createData` and an `updateData`, there is also a `removeData`. If there is a `createConnection`, there is a `removeConnection`. IDE auto-complete and common sense are your allies in this regard.

When you want to fetch a piece of data, you can call `getDataKeyValue`. If you want to do it statefully, you can call the hook `useGetDataKeyValue`. If you want to subscribe to it, you can call the hook `useOnDataKeyValue`.

All of this is obsfucated away from the developer who can simply reach for the data as they need it. Just be sure to check what is happening under-the-hood to make sure you aren't doing something otherwise silly, like calling a custom hook within a `useEffect`.

### Helper Functions & Hooks

Take a moment to skim these two files in order to understand the underlying functions for working with a FirebaseHech Database:

- `firebase-hech/services/client-data.ts`
- `firebase-hech/services/server-data.ts`

Feel free to look at `firebase-hech-ui/hooks`, but you will probably mainly use the following to start:

- `useOnDataKeyValue`
- `useGetDataKeyValue`
- `useOnConnectionsTypeData`

### Context Generators

One of the neatest features that FirebaseHech provides is a way to quickly build out your global state using context generaters. See:

- `firebase-hech-ui/context`

There are two likely to be used the most:

- `createConnectionsTypeDataContext`
- `createUserTypeDataContext`

Below is the example usage of `createConnectionsTypeDataContext`:

```tsx
import { createConnectionsTypeDataContext } from "firebase-hech-ui/context/createConnectionsTypeDataContext";

const {
  useConnectionsTypeDataContext: useManagerUsersContext,
  ConnectionsTypeDataContextProviderComponent: ManagerUsersContextProviderComponent,
} = createConnectionsTypeDataContext("manager", "user");

export { useManagerUsersContext, ManagerUsersContextProviderComponent };
```

```tsx
<ManagerUsersContextProviderComponent>{globalContextWrappedAppHere}</ManagerUsersContextProviderComponent>
```

```tsx
const { dataArray: usersConnectedToTheManager } = useManagerUsersContext("{managerUid}");
```

### Components

There are a few components that we have provided, they can be found in:

- `firebase-hech-ui/components`

The one which helps with infinite scroll is the `DataInViewItem`. There is another component which makes this truly powerful and easy to use. It is called the `ConnectionsObserverHOC` and is used like so:

```tsx
<ConnectionsObserverHOC
  className={styles.messages}
  listItemMinHeightPx={35}
  listItemMinWidthPx={100}
  hydrationBufferAmount={10}
  version="connectionDataList"
  parentDataType="chatContent"
  parentDataKey={chatKey}
  dataType="chatMessage"
  sort="created newest"
  managePagination={PAGINATION}
  ignoreNonStartingEdgeAdditions
  grouping="day"
  GroupingComponent={Grouping}
  ItemComponent={ChatInView}
  EmptyComponent={NoMessages}
/>
```

Where the `ChatInView` is like so:

```tsx
import { ItemComponentProps, useCacheHook } from "firebase-hech-ui";

export function ChatInView({
  data: message, // (1) This is the data itself which is automatically hydrated when scrolled into view
  dataKey,
  observed,
  getCache,
  idx,
  list,
  top,
  bottom,
}: // ...etc.
ItemComponentProps<"chatMessage", "chatContent">) {
  const { user } = useFirebaseHechContext();
  const userUid = user?.uid;

  const authorUid = "authorUid"; // ...get the author uid somehow

  // (2) But you can also fetch data yourself based on the `observed` variable. In this example, we also use the cache:

  // Cache the data that you want to fetch but that
  // you know will be repeated throughout the infinite scroll
  const author = useCacheHook("appUser", authorUid, getCache, {
    fetchIfNull: false,
    initialized: observed, // Wait until the component has scrolled into view (`observed`) before fetching
  });

  if (!userUid) return null;

  return (
    <div>
      <div>{message.content}</div>
      <div>By {author.name}</div>
    </div>
  );
}
```

## Impactful Conventions

There are a few conventions we employ that have real consequences in using FirebaseHech.

### Initialization and Falsey Keys in Helpers

When using a helper function like `useOnDataKeyValue`, if the `dataKey` is falsey (an empty string), the fetch will not be made at all. This is very useful. For example, if you are hydrating data on load, it will not bother to fetch the manager's users until the manager has been logged in and we have retrieved the manager's data key. Furthermore, you can control this directly with a third boolean argument: `initialized`.

### Null vs Undefined

Note, passing `undefined` to Firebase at any time will break. Firebase only allows `null`, which will delete the data at that location. Therefore, your types won't perfectly reflect the reality that: Firebase may return `undefined` to you when nothing is at a target database location but will break if you pass `undefined` to a database location. Similarly, you may pass `null` to a database location to delete that data, but if you fetch that location, you will get `undefined` rather than `null`. This is a Firebase quirk to be aware of. Also note, when deleting data key values (an instance of a data type, ie. a user), do not use `null`, use the given FirebaseHech function: `removeData`.

However, even though Firebase returns `undefined` in such cases, most FirebaseHech helper functions override this with `null`. We consider `undefined` values to mean that the fetching has not yet been done and `null` values to mean that the fetching was done but nothing was returned. In this way, not only do we harmonize Firebase's `undefined`/`null` descrepancy, but also we enable the developer to know if it is loading or loaded regardless of whether or not there was a valid resource at the target location just by checking the value of `undefined` vs `null`.
