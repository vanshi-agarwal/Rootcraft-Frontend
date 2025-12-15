"use client";

import dynamic from "next/dynamic";
import React from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
        ],
    };

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "link",
        "image",
    ];

    return (
        <div className="bg-white">
            <style jsx global>{`
        .ql-container.ql-snow {
          border: 1px solid #E5E0D8;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          min-height: 200px;
          font-family: var(--font-poppins);
          font-size: 1rem;
        }
        .ql-toolbar.ql-snow {
          border: 1px solid #E5E0D8;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border-bottom: none;
          background-color: #FAF9F6;
        }
        .ql-editor {
          min-height: 200px;
        }
      `}</style>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
            />
        </div>
    );
}
