import instance from "./axios";

const uploadFiles = (projectID, files) => {
  const options = {
    headers: { "Content-Type": "multipart/form-data" },
  };
  return instance.post(`/projects/${projectID}/upload`, files, options);
};

const listImages = (projectID, queryString = "&page=1&size=24") => {
  const res = instance.get(`/images?project_id=${projectID}${queryString}`);
  console.log(res);
  return res;
};

const trainModel = (projectID) => {
  return instance.post(`/projects/${projectID}/train`);
};

export { listImages, trainModel, uploadFiles };
