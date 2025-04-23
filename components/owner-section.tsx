import { UICardContainer } from "./ui-card-container";
import { BilingualDataItem } from "./bilingual-data-item";

interface OwnerSectionProps {
  data: any;
}

export function OwnerSection({ data }: OwnerSectionProps) {
  const ownerFields = [
    { label: "Owner", value: data.owner },
    { label: "Nationality", value: data.nationality },
    { label: "Place of Issue", value: data.placeOfIssue },
    { label: "Registration Expiry", value: data.expiryDate },
    { label: "Insurance Expiry", value: data.insuranceExpiry },
    { label: "Policy Number", value: data.policyNo },
    { label: "Mortgaged By", value: data.mortgagedBy },
  ];

  return (
    <UICardContainer title="Owner Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ownerFields.map((field, index) => (
          <BilingualDataItem
            key={`owner-${index}`}
            label={field.label}
            value={field.value}
            index={index}
          />
        ))}
      </div>
    </UICardContainer>
  );
}