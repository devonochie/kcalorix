import { api } from "./client";
import type {
  AddMealBatchRequest, AddMealEntryRequest, DiaryResponse, FoodDetailResponse,
  FoodSearchItem, FoodSearchParams, LocalDate, MealEntryResponse, PageResponse,
  RecognitionResponse, UpdateMealEntryRequest, UUID,
} from "../../types";

export const foodsApi = {
  search: (params?: FoodSearchParams) =>
    api.get<PageResponse<FoodSearchItem>>("/foods/search", { params }).then((r) => r.data),
  detail: (fdcId: number) =>
    api.get<FoodDetailResponse>(`/foods/${fdcId}`).then((r) => r.data),
};

export const diaryApi = {
  /** date defaults to today on the server */
  get: (date?: LocalDate) =>
    api.get<DiaryResponse>("/diary", { params: { date } }).then((r) => r.data),
};

export const mealsApi = {
  add: (body: AddMealEntryRequest) =>
    api.post<MealEntryResponse>("/meals", body).then((r) => r.data),
  update: (id: UUID, body: UpdateMealEntryRequest) =>
    api.put<MealEntryResponse>(`/meals/${id}`, body).then((r) => r.data),
  remove: (id: UUID) => api.delete<void>(`/meals/${id}`).then(() => undefined),
  addBatch: (body: AddMealBatchRequest) =>
    api.post<MealEntryResponse[]>("/meals/batch", body).then((r) => r.data),
};

export const recognitionApi = {
  /** Sends the photo as multipart field "image" */
  detect: (image: File | Blob) => {
    const form = new FormData();
    form.append("image", image);
    return api
      .post<RecognitionResponse>("/recognition/detect", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};
