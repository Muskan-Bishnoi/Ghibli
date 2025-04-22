import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectItem, SelectContent } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const styles = [
  { label: "Ghibli", value: "ghibli" },
  { label: "Comic Book", value: "comic" },
  { label: "3D", value: "3d" },
  { label: "Pixar", value: "pixar" },
  { label: "Disney", value: "disney" },
];

export default function App() {
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [fileBlob, setFileBlob] = useState<File | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("ghibli");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileBlob(file);
      setInputImage(URL.createObjectURL(file));
      setError(null);
    }
  };

  const generateImage = async () => {
    if (!fileBlob) {
      setError("Please upload an image.");
      return;
    }

    if (!selectedStyle) {
      setError("Please select a style.");
      return;
    }

    setLoading(true);
    setError(null);
    setOutputImage(null);

    const formData = new FormData();
    formData.append("file", fileBlob);
    formData.append("style", selectedStyle);

    try {
      const res = await fetch("http://localhost:8000/stylize/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.image) {
        setOutputImage(`data:image/png;base64,${data.image}`);
      } else {
        throw new Error(data.error || "Something went wrong during image generation.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (outputImage) {
      const a = document.createElement("a");
      a.href = outputImage;
      a.download = "styled-image.png";
      a.click();
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-tr from-pink-100 to-blue-100 flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold text-pink-600 mb-4">🎨 Cute AI Image Styler</h1>

      {error && (
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Oops!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-md p-4">
        <CardContent className="flex flex-col gap-4">
          <Input type="file" accept="image/*" onChange={handleImageUpload} />
          <Select onValueChange={setSelectedStyle} defaultValue={selectedStyle}>
            <SelectTrigger>Choose Style</SelectTrigger>
            <SelectContent>
              {styles.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={generateImage} disabled={loading}>
            {loading ? "✨ Generating..." : "✨ Generate"}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-6">
        {inputImage && (
          <div className="text-center">
            <h2 className="font-semibold mb-2">Original Image</h2>
            <img src={inputImage} className="w-64 rounded-xl shadow-md" alt="Original" />
          </div>
        )}
        {outputImage && (
          <div className="text-center">
            <h2 className="font-semibold mb-2">Styled Image ({selectedStyle})</h2>
            <img src={outputImage} className="w-64 rounded-xl shadow-md" alt="Styled" />
            <Button onClick={downloadImage} className="mt-4">⬇️ Download</Button>
          </div>
        )}
      </div>
    </div>
  );
}
