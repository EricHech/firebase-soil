import type { SoilDatabase } from "../services/types";
import {
  isoCreateData,
  isoUpdateData,
  isoUpsertData,
  isoRemoveData,
  isoGetOwners,
  isoGetDataKeyValue,
  isoGetDataKeyFieldValue,
  isoQueryData,
  isoGetAllConnections,
  isoRemoveConnections,
  isoGetDataTypeValue,
  isoGetConnectionTypeData,
  isoGetConnectionType,
  isoCreateConnections,
  isoRemoveDataType,
  isoUpdateUser,
  isoChangeDataKey,
  isoCreateUser,
  isoTrackEvent,
  isoGetUser,
  isoAddOwners,
  isoRemoveOwners,
} from "./data";
import { get, push, queryOrderByChildEqualTo, update } from "./admin";
import type {
  CreateDataParams,
  GetDataKeyValueParams,
  UpdateDataParams,
  RemoveDataKeyParams,
  Data,
  QueryDataParams,
  ModifyConnectionsType,
  User,
  ChangeDataKey,
} from "./types";

export const createUser = ({
  user,
  updateObject = {},
  skipUpdate,
  now,
}: Pick<CreateDataParams<SoilDatabase, keyof SoilDatabase>, "updateObject" | "skipUpdate" | "now"> & {
  user: Mandate<User, "uid">;
}) => isoCreateUser({ update, user, updateObject, skipUpdate, now });

export const updateUser = (u: Mandate<User, "uid">) => isoUpdateUser(update, u);

export const getUser = (uid: string) => isoGetUser(get, uid);

export const getDataKeyValue = <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) =>
  isoGetDataKeyValue<T2>(get, dataType, dataKey);

export const getDataTypeValue = <T2 extends keyof SoilDatabase>(dataType: T2) => isoGetDataTypeValue<T2>(get, dataType);

export const getAllConnections = <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) =>
  isoGetAllConnections(get, dataType, dataKey);

export const getConnectionType = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  connectionType,
}: {
  dataType: T2;
  dataKey: string;
  connectionType: T22;
}) => isoGetConnectionType({ get, dataType, dataKey, connectionType });

export const getConnectionTypeData = <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  connectionType,
}: {
  dataType: T2;
  dataKey: string;
  connectionType: T22;
}) =>
  isoGetConnectionTypeData({
    get,
    dataType,
    dataKey,
    connectionType,
  });

export const getDataKeyFieldValue = <T2 extends keyof SoilDatabase, T3 extends keyof Data<T2>>({
  dataType,
  dataKey,
  field,
}: Omit<GetDataKeyValueParams<T2>, "get"> & { field: T3 }) =>
  isoGetDataKeyFieldValue<T2, T3>({ get, dataType, dataKey, field });

export const createData = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners,
  publicAccess,
  connections,
  connectionAccess,
  now = Date.now(),
}: Omit<CreateDataParams<T, T2>, "update"> & {
  dataType: string;
  dataKey: string;
}) =>
  isoCreateData({
    update,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
    data,
    owners,
    publicAccess,
    connections,
    connectionAccess,
    now,
  });

export const updateData = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners,
  connections,
  publicAccess,
  includeUpdatedAt,
  makeGetRequests,
  connectionAccess,
  now,
}: Omit<UpdateDataParams<T, T2>, "update" | "get">) =>
  isoUpdateData({
    update,
    get,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
    data,
    owners,
    connections,
    publicAccess,
    includeUpdatedAt,
    makeGetRequests,
    connectionAccess,
    now,
  });

export const upsertData = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
  data,
  owners,
  publicAccess,
  connections,
  connectionAccess,
  includeUpdatedAt,
  makeGetRequests,
}: Omit<CreateDataParams<T, T2>, "update"> & Omit<UpdateDataParams<T, T2>, "update" | "get">) =>
  isoUpsertData({
    update,
    get,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
    data,
    owners,
    publicAccess,
    connections,
    connectionAccess,
    includeUpdatedAt,
    makeGetRequests,
  });

export const queryData = <T extends SoilDatabase, T2 extends keyof SoilDatabase, T3 extends keyof T[T2]>({
  dataType,
  childKey,
  queryValue,
  limit,
}: Omit<QueryDataParams<T, T2, T3>, "queryOrderByChildEqualTo">) =>
  isoQueryData({
    queryOrderByChildEqualTo,
    dataType,
    childKey,
    queryValue,
    limit,
  });

export const removeData = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  dataType,
  dataKey,
}: Omit<RemoveDataKeyParams<T, T2>, "update" | "get" | "publicAccess" | "now">) =>
  isoRemoveData({
    update,
    get,
    updateObject,
    skipUpdate,
    dataType,
    dataKey,
  });

/** ! CAREFUL */
export const removeDataType = <T2 extends keyof SoilDatabase>(dataType: T2) =>
  isoRemoveDataType({
    update,
    get,
    dataType,
  });

export const getOwners = <T2 extends keyof SoilDatabase>(dataType: T2, dataKey: string) =>
  isoGetOwners(get, dataType, dataKey);

export const addOwners = async <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  updateObject,
  skipUpdate,
  now = Date.now(),
  owners,
}: Pick<
  CreateDataParams<T, T2>,
  "dataType" | "dataKey" | "owners" | "update" | "updateObject" | "skipUpdate" | "now"
>) => isoAddOwners({ update, dataType, dataKey, updateObject, skipUpdate, owners, now });

export const removeOwners = async <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  dataType,
  dataKey,
  updateObject,
  skipUpdate,
  owners,
}: Pick<CreateDataParams<T, T2>, "dataType" | "dataKey" | "owners" | "update" | "updateObject" | "skipUpdate">) =>
  isoRemoveOwners({ update, dataType, dataKey, updateObject, skipUpdate, owners });

export const createConnection = async <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  updateObject,
  skipUpdate,
  now = Date.now(),
  connections,
}: Omit<ModifyConnectionsType<T, T2>, "update">) =>
  isoCreateConnections({ update, updateObject, skipUpdate, connections, now });

export const removeConnection = <T extends SoilDatabase, T2 extends keyof SoilDatabase>({
  connections,
  skipUpdate,
  updateObject,
}: Pick<ModifyConnectionsType<T, T2>, "skipUpdate" | "updateObject" | "connections">) =>
  isoRemoveConnections({ update, connections, skipUpdate, updateObject });

export const trackEvent = (eventName: string, metadata?: object) =>
  isoTrackEvent(push, eventName, "firebase-admin", metadata);

export const changeDataKey = async <T2 extends keyof SoilDatabase, T22 extends keyof SoilDatabase>({
  existingDataType,
  existingDataKey,
  newDataType,
  newDataKey,
}: Omit<ChangeDataKey<T2, T22>, "update" | "get">) =>
  isoChangeDataKey({
    update,
    get,
    existingDataType,
    existingDataKey,
    newDataType,
    newDataKey,
  });
