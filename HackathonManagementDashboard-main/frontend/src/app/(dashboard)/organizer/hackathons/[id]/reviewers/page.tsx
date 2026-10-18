"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ReviewerAssignment } from "../../../../../../components/organizer/ReviewerAssignment";
import { EvaluationProgress } from "../../../../../../components/organizer/EvaluationProgress";

export default function ReviewersPage() {
  const { id } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <ReviewerAssignment
        hackathonId={id as string}
        onRefresh={() => setRefreshKey((currentKey) => currentKey + 1)}
      />
      <EvaluationProgress hackathonId={id as string} key={refreshKey} />
    </div>
  );
}
