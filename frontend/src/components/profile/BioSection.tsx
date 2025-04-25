interface BioSectionProps {
  bio: string;
}

export const BioSection = ({ bio }: BioSectionProps) => (
  <div className="w-1/3">
    <div className="bg-white p-4 rounded-lg border shadow">
      <h2 className="text-lg font-semibold mb-4">Bio</h2>
      <p className="text-gray-700 mb-2">{bio || 'No bio available.'}</p>
    </div>
  </div>
);