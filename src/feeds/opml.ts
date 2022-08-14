// @ts-expect-error add typings
import SaxParser from '@tuananh/sax-parser';
import { createReadStream } from 'fs';
import { join } from 'path';

type FeedCategory = 'unknown' | string;

export interface FeedItem {
    title: string;
    url: string;
    feedURL: string;
    feedType: string;
    feedCategory: FeedCategory;
}

export async function parse(opmlXMLPath: string) {
    return await new Promise<Record<string, FeedItem[]>>((resolve, reject) => {
        const parser = new SaxParser();

        const readStream = createReadStream(
            join(__dirname, opmlXMLPath)
        );

        let feedCategory: FeedCategory = 'unknown';
        const items: FeedItem[] = [];
    
        readStream.pipe(parser)
            .on('error', (code: unknown, offset: unknown) => {
                reject({code, offset});
            })
            .on('startElement', (nodeType: unknown, attrs: Record<string, string>) => {
                if(nodeType === 'outline' && !attrs.xmlUrl) {
                    feedCategory = attrs.text;
                }

                if(nodeType === 'outline') {
                    const feedURL = attrs.xmlUrl;
                    if(!feedURL) { return; }
        
                    items.push({
                        title: attrs.title || attrs.text || attrs.description,
                        url: attrs.htmlUrl,
                        feedURL: feedURL,
                        feedType: attrs.type,
                        feedCategory
                    })
                }
            })
            .on('end', () => {
                const itemsByCategory = items.reduce((acc: Record<string, FeedItem[]>, value) => {
                    if (!acc[value.feedCategory]) {
                      acc[value.feedCategory] = [];
                    }
                  
                    acc[value.feedCategory].push(value);
                  
                    return acc;
                  }, {});

                resolve(itemsByCategory);
            })
    });
}