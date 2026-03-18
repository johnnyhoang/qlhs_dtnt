import axiosClient from './client';

export const getCdsCriteria = async (): Promise<any[]> => {
    const { data } = await axiosClient.get('/cds-evaluations/criteria');
    return data;
};

export const getCdsPeriods = async (): Promise<any[]> => {
    const { data } = await axiosClient.get('/cds-evaluations/periods');
    return data;
};

export const getCdsDashboardStats = async (): Promise<any> => {
    const { data } = await axiosClient.get('/cds-evaluations/dashboard');
    return data;
};

export const getCdsEvaluations = async (): Promise<any[]> => {
    const { data } = await axiosClient.get('/cds-evaluations');
    return data;
};

export const getCdsEvaluationById = async (id: number): Promise<any> => {
    const { data } = await axiosClient.get(`/cds-evaluations/${id}`);
    return data;
};

export const createCdsEvaluation = async (payload: any): Promise<any> => {
    const { data } = await axiosClient.post('/cds-evaluations', payload);
    return data;
};

export const updateCdsEvaluation = async (id: number, payload: any): Promise<any> => {
    const { data } = await axiosClient.put(`/cds-evaluations/${id}`, payload);
    return data;
};
