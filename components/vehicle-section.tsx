import { UICardContainer } from "./ui-card-container";
import { BilingualDataItem } from "./bilingual-data-item";

interface VehicleSectionProps {
  data: any;
}

export function VehicleSection({ data }: VehicleSectionProps) {
  const vehicleFields = [
    { label: "Vehicle Type", value: data.vehicleType },
    { label: "Model Year", value: data.model },
    { label: "Color", value: data.color },
    { label: "Origin", value: data.origin },
    { label: "Traffic Plate Number", value: data.trafficPlateNo },
    { label: "Vehicle Class", value: data.vehicleClass },
    { label: "Chassis Number", value: data.chassisNo },
    { label: "Engine Number", value: data.engineNo },
    { label: "Traffic Code Number", value: data.tcNo },
    { label: "Gross Vehicle Weight", value: data.gvw },
    { label: "Number of Passengers", value: data.numberOfPassengers },
  ];

  return (
    <UICardContainer title="Vehicle Details">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicleFields.map((field, index) => (
          <BilingualDataItem
            key={`vehicle-${index}`}
            label={field.label}
            value={field.value}
            index={index}
          />
        ))}
      </div>
    </UICardContainer>
  );
}
