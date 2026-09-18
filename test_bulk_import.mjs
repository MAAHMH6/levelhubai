import * as XLSX from "xlsx";
import * as fs from "fs";

const data = [
  // 3 valid blogs
  {
    Programme: "O Level",
    Subject: "Mathematics",
    "Blog Topic / Working Title": "Valid Blog 1",
    Slug: "valid-blog-1",
    "Blog Content": "This is valid blog 1 content.",
    "Blog Type": "Guide",
    "Primary Keyword": "valid keyword 1",
    "Featured Image": "https://example.com/img1.jpg",
    "Image Alt Text": "Alt 1"
  },
  {
    Programme: "A Level",
    Subject: "Physics",
    "Blog Topic / Working Title": "Valid Blog 2",
    Slug: "valid-blog-2",
    "Blog Content": "This is valid blog 2 content.",
    "Blog Type": "Tutorial",
    "Primary Keyword": "valid keyword 2"
  },
  {
    Programme: "IGCSE",
    Subject: "Chemistry",
    "Blog Topic / Working Title": "Valid Blog 3",
    Slug: "valid-blog-3",
    "Blog Content": "This is valid blog 3 content.",
    "Blog Type": "Guide"
  },
  // 1 existing blog (slug exists)
  {
    Programme: "O Level",
    Subject: "General",
    "Blog Topic / Working Title": "Existing Blog",
    Slug: "olevel-study-guide",
    "Blog Content": "This slug already exists."
  },
  // 1 duplicate slug (duplicates valid-blog-1)
  {
    Programme: "O Level",
    Subject: "Mathematics",
    "Blog Topic / Working Title": "Duplicate Slug Blog",
    Slug: "valid-blog-1",
    "Blog Content": "This is duplicating the first one."
  },
  // 1 missing title (invalid)
  {
    Programme: "O Level",
    Subject: "Mathematics",
    Slug: "missing-title",
    "Blog Content": "This is missing a title."
  }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Blogs");

XLSX.writeFile(workbook, "test_blogs.xlsx");
console.log("test_blogs.xlsx created successfully.");
