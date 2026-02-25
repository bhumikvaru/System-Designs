import {Trie} from "./Trie"
const trie = new Trie();
 
const abusiveWords = ["idiot", "stupid", "hate" ]
abusiveWords.forEach(word => trie.insert(word))


function maskWord(word:string){
    if(word.length<=2) return "*".repeat(word.length);
    return (word[0]+"*".repeat(word.length-2) + word[word.length-1]);
}


export function maskAbuse(message: string): string {
  const words = message.split(" ");

  return words
    .map(word => {
      let node = trie.root;

      for (const char of word.toLowerCase()) {
        if (!node.children.has(char)) {
          return word;
        }
        node = node.children.get(char)!;
      }

      if (node.isEndOfWord) {
        return maskWord(word);
      }

      return word;
    })
    .join(" ");
}