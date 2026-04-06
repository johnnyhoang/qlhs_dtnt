import React from 'react';
import {
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
} from 'recharts';

interface CdsRadarChartProps {
    data: Array<{
        subject: string;
        A: number;
        fullMark: number;
    }>;
}

const CdsRadarChart: React.FC<CdsRadarChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Truong PT DTNT" dataKey="A" stroke="#1677ff" fill="#1677ff" fillOpacity={0.6} />
                <RechartsTooltip />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default CdsRadarChart;
