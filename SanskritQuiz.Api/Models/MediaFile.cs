using System;

namespace SanskritQuiz.Api.Models
{
    public class MediaFile
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public byte[] Content { get; set; } = Array.Empty<byte>();
        public string Tags { get; set; } = string.Empty;
    }
}
