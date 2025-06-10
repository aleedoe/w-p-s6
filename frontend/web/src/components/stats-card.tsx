import React from "react";
import { Icon } from "@iconify/react";
import { Card, CardBody } from "@heroui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "primary" | "success" | "warning" | "danger" | "secondary" | "default";
  change?: number;
  changeLabel?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  change,
  changeLabel,
}) => {
  return (
    <Card className="border-none">
      <CardBody>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-default-500 text-sm">{title}</p>
            <h3 className="text-2xl font-semibold mt-1">{value}</h3>

            {change !== undefined && (
              <div className="flex items-center mt-2">
                <Icon
                  className={change >= 0 ? "text-success" : "text-danger"}
                  icon={
                    change >= 0 ? "lucide:trending-up" : "lucide:trending-down"
                  }
                  width={16}
                />
                <span
                  className={`text-xs ml-1 ${
                    change >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {Math.abs(change)}%{" "}
                  {changeLabel || (change >= 0 ? "increase" : "decrease")}
                </span>
              </div>
            )}
          </div>

          <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-500`}>
            <Icon icon={icon} width={24} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default StatsCard;
