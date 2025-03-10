using System.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Hosting;
using SixLabors.Fonts;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.Processing;
using Volo.Abp.Caching;
using Volo.Abp.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using System.Reflection;

namespace Ice.Auth.Helpers;

public class VerificationCodeHelper : IScopedDependency
{
    public const int ImageWidth = 600;

    public const int ImageHeight = 300;

    public static string[] ImagePaths = new string[] {
        "images/1.jpg",
        "images/2.jpg",
        "images/3.jpg",
        "images/4.jpg",
        "images/5.jpg"
    };

    protected IDistributedCache<VerificationCodeInfo> VerificationCodeInfoCache { get; }

    protected IHostEnvironment Environment { get; }

    protected IFileProvider FileProvider { get; }

    public VerificationCodeHelper(
        IDistributedCache<VerificationCodeInfo> verificationCodeInfoCache,
        IHostEnvironment environment
    )
    {
        VerificationCodeInfoCache = verificationCodeInfoCache;
        Environment = environment;
        FileProvider = new EmbeddedFileProvider(Assembly.GetExecutingAssembly(), "Ice.Auth");
    }

    public VerificationCode CreateImages()
    {
        var randow = new Random();
        var randomIndex = randow.Next(0, ImagePaths.Length);
        var stream = FileProvider.GetFileInfo(ImagePaths[randomIndex]).CreateReadStream();
        byte[] imageData = new byte[stream.Length];
        stream.Position = 0;
        stream.Read(imageData, 0, imageData.Length);

        // 加载字体
        FontCollection fonts = new FontCollection();
        var fontStrem = FileProvider.GetFileInfo("Helpers/font.ttf").CreateReadStream();
        FontFamily fontFamily = fonts.Add(fontStrem);

        using (var img = Image.Load(imageData))
        {
            Font font = fontFamily.CreateFont(40); // for scaling water mark size is largely ignored.
            var textPositions = GenerateRandomHanziText();

            using (var img2 = img.Clone(ctx =>
            {
                textPositions.ForEach(text =>
                {
                    ApplyScalingWaterMarkSimple(ctx, font, text.Text.ToString(), text.X, text.Y);
                });
            }))
            {
                var sign = Guid.NewGuid().ToString();
                var base64 = img2.ToBase64String(SixLabors.ImageSharp.Formats.Jpeg.JpegFormat.Instance);

                VerificationCodeInfoCache.Set(sign, new VerificationCodeInfo()
                {
                    Positions = textPositions.Select(e => new Position() { X = e.X, Y = e.Y }).ToList(),
                }, new DistributedCacheEntryOptions()
                {
                    AbsoluteExpirationRelativeToNow = new TimeSpan(0, 5, 0),
                });

                StringBuilder sb = new StringBuilder();
                textPositions.ForEach(item => sb.Append(item.Text));
                return new VerificationCode()
                {
                    Sign = sign,
                    Base64 = base64,
                    Text = sb.ToString(),
                };
                // img2.Save("output/simple.png");
            }
        }
    }

    public bool Verify(string sign, IEnumerable<Position> clickPositions)
    {
        var verificationCodeInfo = VerificationCodeInfoCache.Get(sign);
        if (verificationCodeInfo == null)
        {
            return false;
        }

        if (clickPositions.Count() != verificationCodeInfo.Positions.Count())
        {
            return false;
        }

        for (int i = 0; i < clickPositions.Count(); i++)
        {
            var x = verificationCodeInfo.Positions.ElementAt(i).X;
            var y = verificationCodeInfo.Positions.ElementAt(i).Y;
            var clickPosition = clickPositions.ElementAt(i);

            if (clickPosition.X < (x - 20) || clickPosition.X > (x + 20))
            {
                return false;
            }

            if (clickPosition.Y < (y - 20) || clickPosition.Y > (y + 20))
            {
                return false;
            }
        }

        VerificationCodeInfoCache.Remove(sign);
        return true;
    }

    private List<TextPosition> GenerateRandomHanziText()
    {
        // 52 个字
        var hanziCharacters = "人木天心中火水山月风雨花草鸟狗猫书钟学乐林云雪鱼鹿竹桥家梦笑彩长银铁秋春夏冬美丽光影龙虎狮蝶红蓝黄绿你我";
        // 步进
        var span = hanziCharacters.Length / 4;
        var textPositions = new List<TextPosition>();

        for (int i = 0; i < 4; i++) // Generate a captcha with 4 characters
        {
            var randow = new Random();
            var randomIndex = randow.Next(i * span, (i + 1) * span);
            var x = randow.Next(40, ImageWidth - 40);
            var y = randow.Next(40, ImageHeight - 40);
            textPositions.Add(new TextPosition()
            {
                X = x,
                Y = y,
                Text = hanziCharacters[randomIndex]
            });
        }

        return textPositions;
    }

    private IImageProcessingContext ApplyScalingWaterMarkSimple(
        IImageProcessingContext processingContext,
        Font font,
        string text,
        float x,
        float y)
    {
        Size imgSize = processingContext.GetCurrentSize();

        var center = new PointF(x, y);
        var textOptions = new TextOptions(font)
        {
            Origin = center,
            HorizontalAlignment = HorizontalAlignment.Center,
            VerticalAlignment = VerticalAlignment.Center
        };
        Random random = new Random();

        // 生成随机RGB值
        int red = random.Next(256);    // 取值范围：0-31
        int green = random.Next(32);  // 取值范围：0-31
        int blue = random.Next(32);   // 取值范围：0-31

        var color = Color.FromRgb(Convert.ToByte(red), Convert.ToByte(green), Convert.ToByte(blue));

        return processingContext.DrawText(textOptions, text, color);
    }

    public class TextPosition
    {
        public char Text { get; set; }

        public float X { get; set; }

        public float Y { get; set; }
    }

    public class VerificationCode
    {
        public string Sign { get; set; } = "";

        public string Base64 { get; set; } = "";

        public string Text { get; set; } = "";
    }

    public class VerificationCodeInfo
    {
        public IEnumerable<Position> Positions { get; set; } = new List<Position>();
    }

    public class Position
    {
        public float X { get; set; }

        public float Y { get; set; }
    }
}