import Draft from '../models/draft.model.js';
import Subscriber from '../models/subscribe.model.js';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendGeneratedParagraph = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content (string) is required'
      });
    }

    const subscribers = await Subscriber.find({ isActive: true });
    if (!subscribers.length) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found'
      });
    }

    let sentCount = 0;
    const errors = [];

    for (const subscriber of subscribers) {
      const msg = {
        to: subscriber.email,
        from: {
          email: 'densie.t2910@gmail.com',
          name: 'Yip Cheu Fong Financial Advisory'
        },
        subject: title || 'Update from YCK Financial',
        html: `
          <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>{{title}}</title>
  <!--[if !mso]><!-->
  <style type="text/css">
    /* Base */
    body, p, div {
      font-family: 'Muli', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.8;
      color: #333333;
      margin: 0;
      padding: 0;
    }
    p { margin-bottom: 1.8em; }

    /* Layout */
    .header-gradient { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
    .content-container { max-width: 800px; margin: 0 auto; padding: 0 50px; }
    .footer { background-color: #1e293b; color: #94a3b8; }
    .content-block { text-align: left; line-height: 1.8; }
    .content-block p, .content-block ul, .content-block ol { margin-bottom: 1.8em; }
    .content-block ul, .content-block ol { padding-left: 2em; }
    .content-block li { margin-bottom: 0.8em; }
    h1, h2, h3, h4 { margin-top: 1.5em; margin-bottom: 1em; line-height: 1.4; }
    .section-spacing { margin-bottom: 2.0em; }

    /* Responsive */
    @media screen and (max-width: 800px) {
      .content-container { padding: 0 40px; }
    }
    @media screen and (max-width: 600px) {
      .responsive-column { width: 100% !important; }
      .responsive-padding { padding: 30px !important; }
      .responsive-text { font-size: 14px !important; }
      .content-container { padding: 0 30px; }
      p, .content-block p, .content-block ul, .content-block ol { margin-bottom: 1.5em; }
    }
  </style>
  <!--<![endif]-->
</head>
<body style="background-color: #f8fafc;">
  <center class="wrapper">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" valign="top">
          <!-- Main Container -->
          <table width="800" cellpadding="0" cellspacing="0" border="0" class="responsive-column">
            <tr>
              <td style="padding: 40px 0;">
                
                <!-- Header -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td class="header-gradient" style="padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
                      {{#if headerImage}}
                        <img src="http://cdn.mcauto-images-production.sendgrid.net/153a262dca8f32f0/a2fd8df2-753d-486f-ba2e-7f7ac70a7d07/296x296.png" alt="Header Image" 
     style="width:120px; height:auto; margin-bottom:15px; border-radius:8px;" />
                      {{/if}}
                      <h1 style="color:#fff;font-size:28px;margin:0;line-height:1.3;">{{title}}</h1>
                      {{#if category}}
                        <p style="color:#ffffff;opacity:.9;margin:10px 0 0;font-size:16px;">{{category}}</p>
                      {{/if}}
                    </td>
                  </tr>
                </table>

                <!-- Card -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border-radius:0 0 8px 8px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 0;" class="responsive-padding">
                      <div class="content-container">
                        <h2 style="color:#1e293b;font-size:22px;margin:0 0 20px;">Dear {{firstName}},</h2>

                        <!-- Generated Message -->
                        <div class="section-spacing">
                          <div class="content-block" style="color:#333333;">
                            {{{content}}}
                          </div>
                        </div>

                        <!-- Unsubscribe -->
                        <p style="font-size:14px;color:#64748b;margin-top:30px;">
                          If you wish to unsubscribe, please 
                          <a href="{{unsubscribeLink}}" style="color:#64748b;text-decoration:underline;">click here</a>.
                        </p>
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" class="footer" style="border-radius: 8px; margin-top: 30px;">
                  <tr>
                    <td style="padding: 30px; text-align: center;" class="responsive-padding">
                      <p style="margin:0 0 16px 0;color:#e2e8f0;font-size:15px;">Connect With Us</p>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center">
                            <a href="https://www.linkedin.com/in/yipcheufong/" style="margin:0 12px;display:inline-block;">
                              <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" width="28" alt="LinkedIn" style="display:inline-block;border:0;outline:none;">
                            </a>
                            <a href="https://www.instagram.com/cheufong" style="margin:0 12px;display:inline-block;">
                              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="28" alt="Instagram" style="display:inline-block;border:0;outline:none;">
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 20px 0 0 0; font-size: 12px; color: #94a3b8;">
                        © {{currentYear}} Yip Cheu Fong Financial Advisory. All rights reserved.
                      </p>
                      <p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8;">
                        <a href="https://yourdomain.com/privacy" style="color:#94a3b8;text-decoration:underline;">Privacy Policy</a> |
                        <a href="https://yourdomain.com/terms" style="color:#94a3b8;text-decoration:underline;">Terms</a>
                      </p>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
          <!-- /Main Container -->
        </td>
      </tr>
    </table>
  </center>
</body>
</html>

        `
      };

      try {
        await sgMail.send(msg);
        sentCount++;
        console.log(`Email sent to ${subscriber.email}`);
      } catch (e) {
        console.error(`Failed to send to ${subscriber.email}:`, e.response?.body?.errors || e.message);
        errors.push({
          email: subscriber.email,
          error: e.response?.body?.errors || [{ message: e.message }]
        });
      }

      // Small delay between sends to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (errors.length > 0) {
      return res.status(207).json({
        success: false,
        sent: sentCount,
        total: subscribers.length,
        errors
      });
    }

    return res.json({
      success: true,
      sent: sentCount,
      total: subscribers.length
    });

  } catch (err) {
    console.error('Error in sendGeneratedParagraph:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send generated message',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const sendGeneratedToSubscribers = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) {
      return res.status(404).json({
        success: false,
        message: 'Draft not found'
      });
    }

    if (draft.type !== 'generated') {
      return res.status(400).json({
        success: false,
        message: 'Not a generated message draft'
      });
    }

    const subscribers = await Subscriber.find({ isActive: true });
    if (!subscribers.length) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found'
      });
    }

    let sentCount = 0;
    const content = Array.isArray(draft.content)
      ? draft.content.join('<br><br>')
      : (draft.content || '');

    for (const subscriber of subscribers) {
      const msg = {
        to: subscriber.email,
        from: {
          email: 'densie.t2910@gmail.com',
          name: 'Yip Cheu Fong Financial Advisoryl'
        },
        subject: draft.title || 'Update from YCK Financial',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.5;">
              <h2>${draft.title || 'Update'}</h2>
              <p>${content.replace(/\n/g, '<br>')}</p>
              <p>Category: ${draft.category || 'General'}</p>
              <hr />
              <p style="color: #888; font-size: 12px;">
                <a href="${process.env.BASE_URL}/unsubscribe?email=${subscriber.email}">
                  Unsubscribe
                </a>
              </p>
            </body>
          </html>
        `
      };

      try {
        await sgMail.send(msg);
        sentCount++;
        console.log(`Email sent to ${subscriber.email}`);
      } catch (e) {
        console.error(`Failed to send to ${subscriber.email}:`, e.response?.body?.errors || e.message);
      }

      // Small delay between sends
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    await Draft.findByIdAndUpdate(req.params.id, {
      $set: { status: 'published', publishedAt: new Date() }
    });

    return res.json({
      success: true,
      sent: sentCount,
      total: subscribers.length,
      draft: { _id: draft._id, status: 'published' }
    });

  } catch (error) {
    console.error('Error in sendGeneratedToSubscribers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send generated draft',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};