import React from "react";

const data = [
  { id: 1, title: "Diabetes", imageUrl: "https://source.unsplash.com/300x300/?mountain" },
  { id: 2, title: "Stomach Care", imageUrl: "https://source.unsplash.com/300x300/?forest" },
  { id: 3, title: "Derma Care", imageUrl: "https://source.unsplash.com/300x300/?beach" },
  { id: 4, title: "Eye Care ", imageUrl: "https://source.unsplash.com/300x300/?city" },
  { id: 5, title: "Joint,Bone& Muscle Care ", imageUrl: "https://source.unsplash.com/300x300/?city" },
  { id: 6, title: "Kidney Care ", imageUrl: "https://source.unsplash.com/300x300/?city" },
  { id: 7, title: "Liver Care ", imageUrl: "https://source.unsplash.com/300x300/?city" },
  { id: 8, title: "Heart Care ", imageUrl: "https://source.unsplash.com/300x300/?city" },
];

export default function Category() {
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Shop by health Concern</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {data.map(({ id, title, imageUrl }) => (
          <div key={id} className="flex flex-col items-center">
            <div className="w-40 h-40 bg-gray-200 overflow-hidden rounded-md">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-2 text-center text-lg font-medium">{title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
