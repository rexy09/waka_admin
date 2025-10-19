import axios from "axios";
import Env from "../../../config/env";
import { BannerFom } from "./types";

export const useBannerServices = () => {
  const getBannerStatus = async () => {
    return axios.get(Env.baseURL + "/api/ads/stats/");
  };
  const getBanners = async (page:number) => {
    return axios.get(Env.baseURL + "/api/ads/", {
      params: {
        page:page,
      },
    });
  };
  const getBanner = async (banner_id: string) => {
    return axios.get(Env.baseURL + `/api/ads/${banner_id}/`, {});
  };
  const postBanner = async (data: BannerFom) => {
    return axios.post(Env.baseURL + "/api/ads/create/", data);
  };
  const editBanner = async (banner_id: string,data: BannerFom) => {
    return axios.patch(Env.baseURL + `/api/ads/${banner_id}/update/`, data);
  };
  const deleteBanner = async (banner_id: string) => {
    return axios.delete(Env.baseURL + `/api/ads/${banner_id}/delete/`);
  };

  return {
    getBannerStatus,
    getBanners,
    postBanner,
    getBanner,
    editBanner,
    deleteBanner,
  };
};
