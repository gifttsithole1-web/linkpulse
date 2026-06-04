<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{ $headline }}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f8fc;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border:1px solid rgba(15,23,42,0.10);border-radius:12px;padding:20px;">
        <h1 style="margin:0 0 12px 0;font-size:20px;line-height:28px;color:#0b1636;">
          {{ $headline }}
        </h1>
        <div style="font-size:14px;line-height:22px;color:#334155;">
          {!! nl2br(e($body)) !!}
        </div>
        <hr style="border:none;border-top:1px solid rgba(15,23,42,0.08);margin:18px 0;" />
        <p style="margin:0;font-size:12px;line-height:18px;color:#64748b;">
          You’re receiving this because you opted in to LinkPulse product updates.
          <a href="{{ $unsubscribeUrl }}" style="color:#0a56ff;text-decoration:none;">Unsubscribe</a>
        </p>
      </div>
    </div>
  </body>
</html>

