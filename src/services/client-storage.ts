// Services
import { upsertData } from "./client-data";
import { firebaseStoragePut, firebaseStoragePutResumable, pushKey, UploadMetadata } from "./firebase";

// Helpers
import { getDownloadURL } from "firebase/storage";

// Constants
import { PATHS } from "./paths";

// Types
import type { CreateDataParams } from "./types";

type UploadFileParams = Pick<
  CreateDataParams<"firebaseHechFile">,
  "publicAccess" | "connections" | "connectionAccess" | "ownershipAccess"
> & {
  owner: string;
  dataKey?: string;
  file: Blob | Uint8Array | ArrayBuffer;
  metadata?: UploadMetadata;
};

export const uploadFile = async ({
  owner,
  publicAccess,
  connections,
  connectionAccess,
  ownershipAccess,
  file,
  dataKey = pushKey(PATHS.dataType("firebaseHechFile")),
  metadata,
}: UploadFileParams) => {
  const downloadUrl = await firebaseStoragePut(PATHS.storageKey(owner, dataKey), file, metadata);

  await upsertData({
    dataType: "firebaseHechFile",
    dataKey,
    data: { downloadUrl },
    owners: [owner],
    publicAccess,
    connections,
    connectionAccess,
    ownershipAccess,
    makeGetRequests: true,
  });

  return { dataKey, downloadUrl };
};

export const uploadFileResumable = ({
  owner,
  publicAccess,
  connections,
  connectionAccess,
  ownershipAccess,
  file,
  dataKey = pushKey(PATHS.dataType("firebaseHechFile")),
  metadata,
}: UploadFileParams) => {
  const task = firebaseStoragePutResumable(PATHS.storageKey(owner, dataKey), file, metadata);

  const triggerUpsertData = async () => {
    const downloadUrl = await getDownloadURL((await task).ref);

    await upsertData({
      dataType: "firebaseHechFile",
      dataKey,
      data: { downloadUrl },
      owners: [owner],
      publicAccess,
      connections,
      connectionAccess,
      ownershipAccess,
      makeGetRequests: true,
    });

    return downloadUrl;
  };

  return { task, dataKey, triggerUpsertData };
};
