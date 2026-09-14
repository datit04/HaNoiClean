using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace KnowledgeSpace.BackendServer.Services
{
    public class MinioStorageService : IStorageService
    {
        private readonly IMinioClient _minioClient;
        private readonly MinioSettings _settings;

        public MinioStorageService(IOptions<MinioSettings> settings)
        {
            _settings = settings.Value;

            _minioClient = new MinioClient()
                .WithEndpoint(_settings.Endpoint)
                .WithCredentials(_settings.AccessKey, _settings.SecretKey)
                .WithSSL(_settings.UseSSL)
                .Build();
        }

        public string GetFileUrl(string fileName)
        {
            var scheme = _settings.UseSSL ? "https" : "http";
            return $"{scheme}://{_settings.Endpoint}/{_settings.BucketName}/{fileName}";
        }

        public async Task SaveFileAsync(Stream mediaBinaryStream, string fileName)
        {
            await EnsureBucketExistsAsync();

            var putObjectArgs = new PutObjectArgs()
                .WithBucket(_settings.BucketName)
                .WithObject(fileName)
                .WithStreamData(mediaBinaryStream)
                .WithObjectSize(mediaBinaryStream.Length)
                .WithContentType(GetContentType(fileName));

            await _minioClient.PutObjectAsync(putObjectArgs);
        }

        public async Task DeleteFileAsync(string fileName)
        {
            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(_settings.BucketName)
                .WithObject(fileName);

            await _minioClient.RemoveObjectAsync(removeObjectArgs);
        }

        private async Task EnsureBucketExistsAsync()
        {
            var bucketExistsArgs = new BucketExistsArgs()
                .WithBucket(_settings.BucketName);

            bool found = await _minioClient.BucketExistsAsync(bucketExistsArgs);
            if (!found)
            {
                var makeBucketArgs = new MakeBucketArgs()
                    .WithBucket(_settings.BucketName);
                await _minioClient.MakeBucketAsync(makeBucketArgs);

                // Set bucket policy to allow public read for images
                var policy = $$"""
                {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": ["*"]},
                            "Action": ["s3:GetObject"],
                            "Resource": ["arn:aws:s3:::{{_settings.BucketName}}/*"]
                        }
                    ]
                }
                """;

                var setPolicyArgs = new SetPolicyArgs()
                    .WithBucket(_settings.BucketName)
                    .WithPolicy(policy);
                await _minioClient.SetPolicyAsync(setPolicyArgs);
            }
        }

        private static string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName)?.ToLowerInvariant();
            return extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                ".mp4" => "video/mp4",
                _ => "application/octet-stream"
            };
        }
    }
}
