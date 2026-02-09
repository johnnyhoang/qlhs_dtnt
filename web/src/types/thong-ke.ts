// Statistics/Reports Types

export interface MealCutoffByDay {
    sang: number;
    trua: number;
    toi: number;
}

export interface MealCutoffByClass {
    lop: string;
    total_students: number;
    days: {
        [date: string]: MealCutoffByDay;
    };
}

export interface MealCutoffWeeklyReport {
    start_date: string;
    end_date: string;
    dates: string[];
    data: MealCutoffByClass[];
}

export interface MealTypeStats {
    possible: number;
    cut: number;
    served: number;
}

export interface MonthlyMealStats {
    month: number;
    year: number;
    total_students: number;
    total_meal_days: number;
    total_possible_meals: number;
    total_meals_cut: number;
    total_meals_served: number;
    by_meal_type: {
        sang: MealTypeStats;
        trua: MealTypeStats;
        toi: MealTypeStats;
    };
}

export interface TransportStatsByClass {
    lop: string;
    total_students: number;
    students_with_support: number;
    total_distance: number;
    total_amount: number;
}

export interface TransportStatsReport {
    data: TransportStatsByClass[];
    summary: {
        total_students: number;
        total_with_support: number;
        total_distance: number;
        total_amount: number;
    };
}
