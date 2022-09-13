export interface ConfigServiceInterface {
  IMAGE_SIZE: string;
  ACCESS_KEY: string;
  SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  BUCKET_NAME: string;
  SIZE_LIMIT: number;
  ALLOWED_EXTENSIONS: string;
  ALLOWED_CONTENT_TYPES: string;
  RESIZE_SIZE: number;
};

export interface FileUploadParamsInterface {
  filename: string
}
